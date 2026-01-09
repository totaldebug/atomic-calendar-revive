import { mdiCalendar } from '@mdi/js';
import dayjs from 'dayjs';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import EventClass from './event.class';
import { getEventIcon } from '../helpers/get-icon';
import { atomicCardConfig } from '../types/config';
import { HomeAssistant } from '../types/homeassistant';

export function showCalendarLink(config, selectedMonth) {
	if (!config.disableCalLink) {
		return html`<div class="calIconSelector">
			<ha-icon-button
				.path=${mdiCalendar}
				style="--mdc-icon-color: ${config.calDateColor}"
				onClick="window.open('https://calendar.google.com/calendar/r/month/${selectedMonth.format(
					'YYYY',
				)}/${selectedMonth.format('MM')}/1'), '${config.linkTarget}'"
			>
			</ha-icon-button>
		</div>`;
	} else {
		return html``;
	}
}

export function setNoEventDays(
	config: atomicCardConfig,
	singleEvents,
	customStart?: dayjs.Dayjs,
	customEnd?: dayjs.Dayjs,
) {
	// Create an array of days to show
	const daysToShow = config.maxDaysToShow! == 0 ? config.maxDaysToShow! : config.maxDaysToShow! - 1;
	const initialTime = customStart
		? customStart.startOf('day')
		: dayjs().add(config.startDaysAhead!, 'day').startOf('day');
	const endTime = customEnd
		? customEnd.endOf('day')
		: dayjs()
				.add(daysToShow + config.startDaysAhead!, 'day')
				.endOf('day');
	const allDates: any = [];
	for (let q = initialTime; q.isBefore(endTime); q = q.add(1, 'day')) {
		allDates.push(q);
	}
	allDates.map((day) => {
		let isEvent: boolean = false;

		for (let i = 0; i < singleEvents.length; i++) {
			if (singleEvents[i].startDateTime.isSame(day, 'day')) {
				isEvent = true;
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
			};
			const emptyEvent = new EventClass(emptyEv, config);
			emptyEvent.isEmpty = true;
			singleEvents.push(emptyEvent);
			isEvent = false;
		}
	});
	return singleEvents;
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
	if (!config.showMultiDayEventParts === true || (event.addDays === false && event.daysLong === undefined)) {
		return;
	} else if (config.showMultiDayEventParts === true && event.addDays !== false && event.daysLong) {
		return html`(${event.addDays + 1}/${event.daysLong})`;
	} else if (config.showMultiDayEventParts === true && event.addDays === false && event.daysLong) {
		const daysSinceStart = dayjs(event.startTimeToShow).diff(event.startDateTime, 'day');

		return html`(${daysSinceStart + 1}/${event.daysLong})`;
	} else {
		return html``;
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

/**
 * Truncates HTML string based on text content length
 * @param input HTML string
 * @param limit Character limit
 * @returns Truncated HTML (as text if truncated) or original HTML
 */
export function truncateHtml(input: string, limit: number): string {
	const div = document.createElement('div');
	div.innerHTML = input;
	if (div.innerText.length > limit) {
		return div.innerText.substring(0, limit) + '...';
	}
	return input;
}

/**
 * Gets the title html for an event mode event
 * @param config card configuration
 * @param event event to get title html for
 * @returns TemplateResult containing title HTML
 */
export function getTitleHTML(config: atomicCardConfig, event: EventClass, hass: HomeAssistant, mode: string) {
	const titleColor: string =
		typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : config.eventTitleColor;
	const dayClassEventRunning = event.isRunning ? `running` : ``;
	const textDecoration: string = event.isDeclined ? 'line-through' : 'none';
	let { title } = event;

	if (!isHtml(event.title) && config.titleLength && event.title.length > config.titleLength) {
		title = event.title.slice(0, config.titleLength) + '...';
	}
	if (config.disableEventLink || event.htmlLink === undefined || event.htmlLink === null) {
		return html`
			<div
				class="event-title ${dayClassEventRunning} ${mode}"
				style="text-decoration: ${textDecoration};color: ${titleColor}"
			>
				${getEventIcon(config, event, hass)} ${title} ${getMultiDayEventParts(config, event)}
			</div>
		`;
	} else {
		return html`
			<a href="${event.htmlLink}" style="text-decoration: ${textDecoration};" target="${config.linkTarget}">
				<div class="event-title ${dayClassEventRunning} ${mode}" style="color: ${titleColor}">
					${getEventIcon(config, event, hass)} <span>${title} ${getMultiDayEventParts(config, event)} </span>
				</div>
			</a>
		`;
	}
}

/**
 * generate Event Location link HTML
 * @param config card configuration
 * @param event event to get location from
 * @returns TemplateResult containing location information
 */
export function getLocationHTML(config: atomicCardConfig, event: EventClass) {
	if (!event.location || !config.showLocation) {
		return html``;
	} else if (config.disableLocationLink) {
		return html`<ha-icon
				class="event-location-icon"
				style="--location-icon-color: ${config.locationIconColor}"
				icon="mdi:map-marker"
			></ha-icon
			>&nbsp;${event.address}`;
	} else {
		const loc: string = event.location;
		const location: string = loc.startsWith('http') ? loc : 'https://maps.google.com/?q=' + loc;
		return html`<a
			href=${location}
			target="${config.linkTarget}"
			class="location-link"
			style="--location-link-size: ${config.locationTextSize}%"
		>
			<ha-icon
				class="event-location-icon"
				style="--location-icon-color: ${config.locationIconColor}"
				icon="mdi:map-marker"
			>
			</ha-icon
			>&nbsp;${event.address}
		</a>`;
	}
}

/**
 * Gets the location for the event and displays if required
 * @param config card configuration
 * @param event event to get location for
 * @returns TemplateResult with location icon and link
 */
export function getCalendarLocationHTML(config: atomicCardConfig, event: EventClass) {
	if (!event.location || !config.showLocation || config.disableCalLocationLink) {
		return html``;
	} else {
		const loc: string = event.location;
		const location: string = loc.startsWith('http') ? loc : 'https://maps.google.com/?q=' + loc;
		return html`
			<a
				href=${location}
				target="${config.linkTarget}"
				class="location-link"
				style="--location-link-size: ${config.locationTextSize}%"
			>
				<ha-icon
					class="event-location-icon"
					style="--location-icon-color: ${config.locationIconColor}"
					icon="mdi:map-marker"
				></ha-icon
				>&nbsp;
			</a>
		`;
	}
}

export function getDescription(config: atomicCardConfig, event: EventClass) {
	if (config.showDescription && event.description) {
		let { description } = event;
		if (isHtml(event.description)) {
			if (config.descLength) {
				description = truncateHtml(event.description, config.descLength);
			}
			description = unsafeHTML(description);
		}

		if (!isHtml(event.description) && config.descLength && event.description.length >= config.descLength) {
			description = html`${event.description.slice(0, config.descLength)}`;
		}
		return html`<div class="event-right">
			<div class="event-main">
				<div
					class="event-description"
					style="--description-color: ${config.descColor}; --description-size: ${config.descSize}%"
				>
					${description}
				</div>
			</div>
		</div>`;
	}
	return html``;
}

/**
 * Gets the calendar description and wraps in html
 * @param config calendar card configuration
 * @param event event record
 * @returns html description
 */
export function getCalendarDescriptionHTML(config: atomicCardConfig, event: EventClass) {
	if (event.description) {
		let { description } = event;
		if (isHtml(event.description)) {
			if (config.descLength) {
				description = truncateHtml(event.description, config.descLength);
			}
			description = unsafeHTML(description);
		}
		if (!isHtml(event.description) && config.descLength && event.description.length > config.descLength) {
			description = event.description.slice(0, config.descLength);
		}
		return html`<div
			class="calDescription"
			style="--description-color: ${config.descColor}; --description-size: ${config.descSize}%"
		>
			- ${description}
		</div>`;
	} else {
		return html`;`;
	}
}
