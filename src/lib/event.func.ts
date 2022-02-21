import { computeStateDomain, HomeAssistant } from "custom-card-helpers";
import dayjs from "dayjs";
import { AtomicCalendarReviveEditor } from "../index-editor";
import { atomicCardConfig } from "../types";
import CalendarDay from "./calendar.class";
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
 *
 * @param regex regex that should be checked
 * @param field field to check against
 * @returns
 */
export function checkFilter(str: string, regexList: string) {
    if (typeof regexList != 'undefined' && regexList != '') {
        const regex = new RegExp(regexList, 'i');
        if (regex.test(str)) return true;
        else return false;
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
 * create array for 42 calendar days
 * showLastCalendarWeek
 */
function buildCalendar(config: atomicCardConfig, selectedMonth) {
    const firstDay = selectedMonth.startOf('month');
    const dayOfWeekNumber = firstDay.day();
    const month: any = [];
    let weekShift = 0;
    dayOfWeekNumber - config.firstDayOfWeek! >= 0 ? (weekShift = 0) : (weekShift = 7);
    for (
        let i = config.firstDayOfWeek! - dayOfWeekNumber - weekShift;
        i < 42 - dayOfWeekNumber + config.firstDayOfWeek! - weekShift;
        i++
    ) {
        month.push(new CalendarDay(firstDay.add(i, 'day'), i));
    }
    return month
}

/**
 * Gets events for EventMode specifically, calculations for the dates are different
 * to calendar mode hence the different function
 *
 * @param config Card Configuration
 * @param hass Hassio Options
 * @returns List of Events
 */
export async function getEventMode(config: atomicCardConfig, hass) {

    const daysToShow = config.maxDaysToShow! == 0 ? config.maxDaysToShow! : config.maxDaysToShow! - 1;
    const today = dayjs().startOf('day');
    const start = today
        .add(config.startDaysAhead!, 'day');
    const end = today
        .add(daysToShow + config.startDaysAhead!, 'day');
    const getEvents = await getAllEvents(start, end, config, hass)

    return getEvents;
}

/**
 * Gets events for CalendarMode specifically, calculations for the dates are different
 * to event mode hence the different function
 *
 * @param config Card Configuration
 * @param hass Hassio Options
 * @param monthToGet Month to collect data from
 */
export async function getCalendarMode(config: atomicCardConfig, hass, selectedMonth) {
    const month = buildCalendar(config, selectedMonth);
    const { events, failedEvents } = await getAllEvents(month[0].date, month[41].date, config, hass);

    // link events to the specific day of the month
    month.map((day: CalendarDay) => {
        events.map((event: EventClass) => {
            if (event.startDateTime.isSame(day.date, 'day')) {
                day.allEvents.push(event);
            }
        });
        return day;
    })
    return month;
}

/**
   * gets events from HA, this is for both Calendar and Event mode
   *
   */
export async function getAllEvents(start: dayjs.Dayjs, end: dayjs.Dayjs, config: atomicCardConfig, hass) {

    // format times correctly
    const today = dayjs().startOf('day');
    const dateFormat = 'YYYY-MM-DDTHH:mm:ss';
    const timeOffset = -dayjs().utcOffset();

    const startTime = start
        .add(timeOffset, 'minutes')
        .format(dateFormat);
    const endTime = end
        .add(timeOffset, 'minutes')
        .format(dateFormat);

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
            .add(timeOffset, 'minutes').format(dateFormat) : endTime;

        const url: string = `calendars/${entity.entity}?start=${startTime}Z&end=${entityEnd}Z`;

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

        // if hideDeclined events then filter out
        if (config.hideDeclined && newEvent.isDeclined) return events;

        // if given blocklist value, ignore events that match this title
        if (newEvent.entityConfig.blocklist && newEvent.title) {
            const regex = new RegExp(newEvent.entityConfig.blocklist, 'i');
            if (regex.test(newEvent.title)) return events;
        }

        // if given blocklistLocation value, ignore events that match this location
        if (newEvent.entityConfig.blocklistLocation && newEvent.location) {
            const regex = new RegExp(newEvent.entityConfig.blocklistLocation, 'i');
            if (regex.test(newEvent.location)) return events;
        }

        // if given allowlist value, ignore events that dont match the title
        if (newEvent.entityConfig.allowlist && newEvent.title) {
            const regex = new RegExp(newEvent.entityConfig.allowlist, 'i');
            if (!regex.test(newEvent.title)) return events;
        }

        // if given allowlistLocation value, ignore events that dont match the location
        if (newEvent.entityConfig.allowlistLocation && newEvent.location) {
            const regex = new RegExp(newEvent.entityConfig.allowlistLocation, 'i');
            if (!regex.test(newEvent.location)) return events;
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
            events.push(newEvent);
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
