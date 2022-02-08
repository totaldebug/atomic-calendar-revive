import { computeStateDomain, HomeAssistant } from "custom-card-helpers";
import dayjs from "dayjs";
import { atomicCardConfig } from "../types";
import EventClass from "./event.class";

/**
  * remove Duplicate
  * @return {TemplateResult}
  */
export function removeDuplicates(dayEvents) {
    const filtered = dayEvents.filter(
        (temp => a =>
            (k => !temp[k] && (temp[k] = true))(a.summary + '|' + a.startTime + '|' + a.endTime)
        )(Object.create(null))
    );
    return filtered
}

/**
 * if a time filter is set and event is between the times, return true
 * @param event
 * @param startFilter
 * @param endFilter
 * @returns {boolean}
 */
function checkTimeFilter(event: EventClass, startFilter, endFilter) {
    return (
        dayjs(event.startDateTime).isAfter(startFilter, 'hour') &&
        dayjs(event.startDateTime).isBefore(endFilter, 'hour')
    );
}

/**
 * check if string contains one of keywords
 * @param {string} string to check inside
 * @param {string} comma delimited keywords
 * @return {bool}
 */
export function checkFilter(str, filter) {
    if (typeof filter != 'undefined' && filter != '') {
        const keywords = filter.split(',');
        return keywords.some((keyword) => {
            if (RegExp('(?:^|\\s)' + keyword.trim(), 'i').test(str)) return true;
            else return false;
        });
    } else return false;
}

/**
  * group events by the day it's on
  * @param  {Array<EventClass>} events
  * @param  {Object} config
  * @return {Array<Object>}
  */
export function groupEventsByDay(events, config) {

    // grouping events by days, returns object with days and events
    const ev: any[] = [].concat(...events);
    const groupsOfEvents = ev.reduce(function (r, a: { daysToSort: number }) {
        r[a.daysToSort] = r[a.daysToSort] || [];
        r[a.daysToSort].push(a);
        return r;
    }, {});

    let groupedEvents = Object.keys(groupsOfEvents).map(function (k) {
        return groupsOfEvents[k];
    });

    // check if the maxEventCount is set, if it is we will remove any events
    // that go over this limit, unless softLimit is set, in which case we
    // will remove any events over the soft limit
    if (config.maxEventCount) {
        if ((!config.softLimit && config.maxEventCount < events.length) ||
            (config.softLimit && events.length > config.maxEventCount + config.softLimit)
        ) {
            //TODO: hidden events?
            events.length = config.maxEventCount
        }

    }
    groupedEvents = groupedEvents

    return groupedEvents;
}


/**
   * gets events from HA to Events mode
   *
   */
export async function getAllEvents(config: atomicCardConfig, hass) {

    // create URL Params
    const daysToShow = config.maxDaysToShow! == 0 ? config.maxDaysToShow! : config.maxDaysToShow! - 1;
    const dateFormat = 'YYYY-MM-DDTHH:mm:ss'
    const timeOffset = -dayjs().utcOffset();
    const today = dayjs().startOf('day')
    const start = today
        .add(config.startDaysAhead!, 'day')
        .add(timeOffset, 'minutes')
        .format(dateFormat)
    const end = today
        .add(daysToShow + config.startDaysAhead!, 'day')
        .add(timeOffset, 'minutes')
        .format(dateFormat)

    // for each calendar entity get all events
    // each entity may be a string of entity id or
    // an object with custom name given with entity id
    const allEvents: any[] = [];
    const failedEvents: any[] = [];

    const calendarEntityPromises: any[] = [];
    config.entities.map((entity) => {
        const calendarEntity = (entity && entity.entity) || entity;

        // get correct end date if maxDaysToShow is set
        const entityEnd = typeof entity.maxDaysToShow != 'undefined' ? today
            .add(entity.maxDaysToShow! - 1 + config.startDaysAhead!, 'day')
            .add(timeOffset, 'minutes').format(dateFormat) : end;
        const url: string = `calendars/${entity.entity}?start=${start}Z&end=${entityEnd}Z`;

        // make all requests at the same time
        calendarEntityPromises.push(hass.callApi('GET', url)
            .then(rawEvents => {
                rawEvents.map(event => {
                    event.entity = entity;
                    event.calendarEntity = calendarEntity;
                    event.hassEntity = hass.states[calendarEntity];
                })
                return rawEvents
            })
            .then(events => {
                allEvents.push(...events);
            })
            .catch(error => {
                failedEvents.push({
                    name: entity.name || calendarEntity,
                    error
                });
            })
        )
    });

    await Promise.all(calendarEntityPromises);
    return { failedEvents, events: processEvents(allEvents, config) };
}

/**
 * converts all calendar events to CalendarEvent objects
 * @param {Array<Events>} list of raw caldav calendar events
 * @return {Promise<Array<EventClass>>}
 */
export function processEvents(allEvents: any[], config: atomicCardConfig) {
    let newEvents = allEvents.reduce((events, calEvent) => {
        calEvent.originCalendar = config.entities.find(entity => entity.entity === calEvent.entity.entity);
        const newEvent: EventClass = new EventClass(calEvent, config);

        // if given blacklist value, ignore events that match this title
        if (newEvent.entity.blacklist && newEvent.title) {
            const regex = new RegExp(newEvent.entity.blacklist, 'i');
            if (regex.test(newEvent.title)) return events;
        }

        // if hideDeclined events then filter out
        if (config.hideDeclined && newEvent.isDeclined) return events;

        // if given blocklistLocation value ignore events that match this location
        if (newEvent.entity.blocklistLocation && newEvent.location) {
            const regex = new RegExp(newEvent.entity.blocklistLocation, 'i');
            if (regex.test(newEvent.location)) return events;
        }


        /**
         * if we want to split multi day events and its a multi day event then
         * get how long then event is and for each day
         * copy the event, add # of days to start/end time for each event
         * then add as 'new' event
         */
        if (config.showMultiDay && newEvent.isMultiDay) {
            const partialEvents = newEvent.splitIntoMultiDay(newEvent);
            events = events.concat(partialEvents);
        } else {
        }

        return events;
    }, []);

    // if hideDuplicates remove any duplicate events where
    // title, startDateTime and endDateTime match
    if (config.hideDuplicates) {
        newEvents = newEvents.filter(
            (temp => a => (k => !temp[k] && (temp[k] = true))(a.title + '|' + a.startDateTime + '|' + a.endDateTime)
            )(Object.create(null))
        )
    }

    // sort events by date starting with soonest
    if (config.sortByStartTime) {
        newEvents.sort((a: EventClass, b: EventClass) => a.startDateTime.isBefore(b.startDateTime) ? -1 : 1);
    }

    return newEvents;
}
