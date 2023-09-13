import dayjs, { Dayjs } from "dayjs";
import { html } from "lit";
import { atomicCardConfig } from "../types/config";
import EventClass from "./event.class";
import { mdiCalendar } from "@mdi/js";

export function showCalendarLink(config, selectedMonth) {
	if (!config.disableCalLink) {
		return html`<div class="calIconSelector">
				<ha-icon-button
					.path=${mdiCalendar}
          style="--mdc-icon-color: ${config.calDateColor}"
					onClick="window.open('https://calendar.google.com/calendar/r/month/${selectedMonth.format('YYYY')}/${selectedMonth.format('MM')}/1'), '${config.linkTarget}'"
				>
				</ha-icon-button>
			</div>`;
	}
}


export function setNoEventDays(config: atomicCardConfig, singleEvents) {
	// Create an array of days to show
	const daysToShow = config.maxDaysToShow! == 0 ? config.maxDaysToShow! : config.maxDaysToShow! - 1;
	let initialTime = dayjs()
		.add(config.startDaysAhead!, 'day')
		.startOf('day')
		, endTime = dayjs()
			.add(daysToShow + config.startDaysAhead!, 'day')
			.endOf('day')
		, allDates: any = [];
	for (let q = initialTime; q.isBefore(endTime, 'day'); q = q.add(1, 'day')) {
		allDates.push(q);
	}
	allDates.map((day) => {
		var isEvent: boolean = false;

		for (var i = 0; i < singleEvents.length; i++) {
			if (singleEvents[i].startDateTime.isSame(day, 'day')) {
				var isEvent = true;
			}
		}
		if (!isEvent) {
			const emptyEv = {
				eventClass: '',
				config: '',
				start: { dateTime: day.endOf('day') },
				end: { dateTime: day.endOf('day') },
				summary: config.noEventText,
				isFinished: false,
				htmlLink: 'https://calendar.google.com/calendar/r/day?sf=true',
			};
			const emptyEvent = new EventClass(emptyEv, config);
			emptyEvent.isEmpty = true;
			singleEvents.push(emptyEvent);
			var isEvent = false;

		}
	});
	return singleEvents

}

export function getDate(config: atomicCardConfig) {
	let date = dayjs().format(config.dateFormat);
	if (config.startDaysAhead && config.offsetHeaderDate) {
		date = dayjs().add(config.startDaysAhead, 'day').format(config.dateFormat);
	}
	return html`${date}`;
}

/**
 * ready-to-use function to remove year from moment format('LL')
 * @param {moment}
 * @return {String} [month, day]
 */

export function getCurrDayAndMonth(locale) {
	const today = locale.format('LL');
	return today
		.replace(locale.format('YYYY'), '') // remove year
		.replace(/\s\s+/g, ' ') // remove double spaces, if any
		.trim() // remove spaces from the start and the end
		.replace(/[??]\./, '') // remove year letter from RU/UK locales
		.replace(/de$/, '') // remove year prefix from PT
		.replace(/b\.$/, '') // remove year prefix from SE
		.trim() // remove spaces from the start and the end
		.replace(/,$/g, ''); // remove comma from the end
}

/**
 * Calculates the event part number to display on the card
 * @param config card configuration
 * @param event event to be checked
 * @returns TemplateResult containing part count
 */
export function getMultiDayEventParts(config: atomicCardConfig, event: EventClass) {
	if (!config.showMultiDayEventParts === true || event.addDays === false && event.daysLong === undefined) {
		return
	}
	if (config.showMultiDayEventParts === true && event.addDays !== false && event.daysLong) {
		return html`(${event.addDays + 1}/${event.daysLong})`
	}
	if (config.showMultiDayEventParts === true && event.addDays === false && event.daysLong) {
		const daysSinceStart = dayjs(event.rawEvent._startDateTime, 'YYYY-MM-DD').diff(event.startDateTime, 'day')
		return html`(${daysSinceStart}/${event.daysLong})`
	}

}

/**
 * Checks if a string is html or not
 * @param input string input to check for html
 * @returns true/false
 */
export function isHtml(input) {
	return /<[a-z]+\d?(\s+[\w-]+=("[^"]*"|'[^']*'))*\s*\/?>|&#?\w+;/i.test(input);
}
