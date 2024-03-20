import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';

import CalendarDay from './calendar.class';
import EventClass from './event.class';
import sortEvents from '../common/sort_events';
import { atomicCardConfig } from '../types/config';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
/**
 * remove Duplicate
 * @return {TemplateResult}
 */
export function removeDuplicates(dayEvents) {
	return dayEvents.filter(
		(
			(temp) => (a) =>
				((k) => !temp[k] && (temp[k] = true))(a.summary + '|' + a.startTime + '|' + a.endTime)
		)(Object.create(null)),
	);
}

/**
 * if a time filter is set and event is between the times, return true
 * @param event
 * @param startFilter
 * @param endFilter
 * @returns {boolean}
 */
function checkBetweenTimeFilter(event: EventClass, startFilter, endFilter) {
	const startTimeHour = startFilter.split(':', 1)[0];
	const startTimeMin = startFilter.split(':', 2)[1];
	const startTime = event.startDateTime.set('hour', startTimeHour).set('minutes', startTimeMin);

	const endTimeHour = endFilter.split(':', 1)[0];
	const endTimeMin = endFilter.split(':', 2)[1];
	const endTime = event.startDateTime.set('hour', endTimeHour).set('minutes', endTimeMin);

	return event.startDateTime.isBetween(startTime, endTime, 'minute', '[]');
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
		if (regex.test(str)) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
 * group events by the day it's on
 * @param  {Array<EventClass>} events
 * @return {Array<Object>}
 */
export function groupEventsByDay(events) {
	// grouping events by days, returns object with days and events
	const ev: any[] = [].concat(...events);
	const groupsOfEvents = ev.reduce(function (r, a: { daysToSort: number }) {
		r[a.daysToSort] = r[a.daysToSort] || [];
		r[a.daysToSort].push(a);
		return r;
	}, {});

	return Object.keys(groupsOfEvents).map(function (k) {
		return groupsOfEvents[k];
	});
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
	return month;
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
	const today = dayjs();
	const start = today.startOf('day').add(config.startDaysAhead!, 'day');
	const end = start.endOf('day').add(daysToShow, 'day');
	return await getAllEvents(start, end, config, hass, 'Event');
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
	const { events } = await getAllEvents(month[0].date, month[41].date, config, hass, 'Calendar');

	// link events to the specific day of the month
	month.map((day: CalendarDay) => {
		events[0].map((event: EventClass) => {
			if (event.startDateTime.isSame(day.date, 'day')) {
				day.allEvents.push(event);
			}
		});
		return day;
	});
	return month;
}

/**
 * gets events from HA, this is for both Calendar and Event mode
 *
 */
export async function getAllEvents(
	start: dayjs.Dayjs,
	end: dayjs.Dayjs,
	config: atomicCardConfig,
	hass,
	mode: 'Event' | 'Calendar',
) {
	// format times correctly
	const dateFormat = 'YYYY-MM-DDTHH:mm:ss';

	const startTime = start.startOf('day').format(dateFormat);

	// for each calendar entity get all events
	// each entity may be a string of entity id or
	// an object with custom name given with entity id
	const allEvents: any[] = [];
	const failedEvents: any[] = [];

	const calendarEntityPromises: any[] = [];
	config.entities.map((entity) => {
		const calendarEntity = (entity && entity.entity) || entity;

		const daysToShow = entity.maxDaysToShow! == 0 ? entity.maxDaysToShow! : entity.maxDaysToShow! - 1;

		const endTime =
			entity.maxDaysToShow === undefined
				? end.endOf('day').format(dateFormat)
				: start.endOf('day').add(daysToShow, 'day').format(dateFormat);

		const url: string = `calendars/${entity.entity}?start=${startTime}&end=${endTime}`;

		// make all requests at the same time
		calendarEntityPromises.push(
			hass
				.callApi('GET', url)
				.then((rawEvents) => {
					rawEvents.map((event) => {
						event.entity = entity;
						event.calendarEntity = calendarEntity;
						event.hassEntity = hass.states[calendarEntity];
					});
					return rawEvents;
				})
				.then((events) => {
					allEvents.push(...events);
				})
				.catch((error) => {
					failedEvents.push({
						name: entity.name || calendarEntity,
						error,
					});
				}),
		);
	});

	await Promise.all(calendarEntityPromises);
	return { failedEvents, events: processEvents(allEvents, config, mode) };
}

/**
 * converts all calendar events to CalendarEvent objects
 * @param {Array<Events>} list of raw caldav calendar events
 * @return {Promise<Array<EventClass>>}
 */
export function processEvents(allEvents: any[], config: atomicCardConfig, mode: 'Event' | 'Calendar') {
	let hiddenEvents: number = 0;
	// reduce all the events into the ones we care about
	// events = all the events we care about
	// calEvent = the current event that is being processed.
	let newEvents = allEvents.reduce((events, calEvent) => {
		calEvent.originCalendar = config.entities.find((entity) => entity.entity === calEvent.entity.entity);

		const newEvent: EventClass = new EventClass(calEvent, config);

		// we need to filter the dates again or all day events will be wrong
		// this is due to the API only bringing a date for full day events
		if (newEvent.isAllDayEvent && newEvent.endDateTime.isBefore(dayjs().add(config.startDaysAhead!, 'day'))) {
			return events;
		}

		// if !showDeclined events then filter out
		// TODO: no longer working as it was removed from the rest API
		if (!config.showDeclined && newEvent.isDeclined) {
			return events;
		}

		// if showAllDayEvents false then filter out
		if (config.showAllDayEvents === false && newEvent.isAllDayEvent) {
			return events;
		}

		// if given blocklist value, ignore events that match this title
		if (newEvent.entityConfig.blocklist && newEvent.title) {
			const regex = new RegExp(newEvent.entityConfig.blocklist, 'i');
			if (regex.test(newEvent.title)) {
				return events;
			}
		}

		// if given blocklistLocation value, ignore events that match this location
		if (newEvent.entityConfig.blocklistLocation && newEvent.location) {
			const regex = new RegExp(newEvent.entityConfig.blocklistLocation, 'i');
			if (regex.test(newEvent.location)) {
				return events;
			}
		}

		// if given allowlist value, ignore events that dont match the title
		if (newEvent.entityConfig.allowlist && newEvent.title) {
			const regex = new RegExp(newEvent.entityConfig.allowlist, 'i');
			if (!regex.test(newEvent.title)) {
				return events;
			}
		}

		// if given allowlistLocation value, ignore events that dont match the location
		if (newEvent.entityConfig.allowlistLocation && newEvent.location) {
			const regex = new RegExp(newEvent.entityConfig.allowlistLocation, 'i');
			if (!regex.test(newEvent.location)) {
				return events;
			}
		}

		if (
			newEvent.entityConfig.startTimeFilter &&
			newEvent.entityConfig.endTimeFilter &&
			!checkBetweenTimeFilter(newEvent, newEvent.entityConfig.startTimeFilter, newEvent.entityConfig.endTimeFilter)
		) {
			return events;
		}

		/**
		 * if we want to split multi day events and its a multi day event then
		 * get how long then event is and for each day
		 * copy the event, add # of days to start/end time for each event
		 * then add as 'new' event
		 */
		if (config.showMultiDay && newEvent.isMultiDay) {
			const partialEvents = newEvent.splitIntoMultiDay(newEvent, mode);
			events = events.concat(partialEvents);
		} else {
			events.push(newEvent);
		}

		return events;
	}, []);
	// Check if the hideFinishedEvents is set, if it is, remove any events
	// that are already finished
	if (config.hideFinishedEvents) {
		newEvents = newEvents.filter(function (e: EventClass) {
			return e.isFinished == false;
		});
	}

	// if hideDuplicates remove any duplicate events where
	// title, startDateTime and endDateTime match
	if (config.hideDuplicates) {
		// Create an object to keep track of event identifiers and associated calendar names
		const eventMap: { [key: string]: { event: any; calendars: string[] } } = {};

		const updatedEvents: any[] = [];

		newEvents.forEach((event) => {
			const eventIdentifier = event.title + '|' + event.startDateTime + '|' + event.endDateTime;

			if (!eventMap[eventIdentifier]) {
				eventMap[eventIdentifier] = {
					event,
					calendars: [event.originName],
				};
				updatedEvents.push(event);
			} else {
				eventMap[eventIdentifier].calendars.push(event.originName);
			}
		});

		// Update calendar names for the kept events and append removed calendar names
		updatedEvents.forEach((event) => {
			const eventIdentifier = event.title + '|' + event.startDateTime + '|' + event.endDateTime;
			if (eventMap[eventIdentifier]) {
				// Check if eventMap[eventIdentifier] is defined
				event.originName = eventMap[eventIdentifier].calendars.join(', ');
			}
		});

		newEvents = updatedEvents;
	}

	// sort events
	newEvents = sortEvents(newEvents, config);

	// check if the maxEventCount is set, if it is we will remove any events
	// that go over this limit, unless softLimit is set, in which case we
	// will remove any events over the soft limit
	if (
		config.maxEventCount &&
		((!config.softLimit && config.maxEventCount < newEvents.length) ||
			(config.softLimit && newEvents.length > config.maxEventCount + config.softLimit))
	) {
		hiddenEvents = newEvents.length - config.maxEventCount;
		newEvents.length = config.maxEventCount;
	}
	return [newEvents, hiddenEvents];
}
