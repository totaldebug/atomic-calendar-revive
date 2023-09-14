import { handleClick, HomeAssistant } from 'custom-card-helpers';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { atomicCardConfig } from '../types/config';
import CalendarDay from './calendar.class';
import { getMultiDayEventParts, isHtml } from './common.html';
import EventClass from './event.class';

dayjs.extend(isoWeek);

/**
 * Checks which calendar icons are required, and adds the icon once
 * to an array that is then displayed in the cell for that day
 * @param day calendarDay
 * @returns mdi icons required for that day
 */
export function handleCalendarIcons(day: CalendarDay) {
	const allIcons: any[] = [];
	const myIcons: any[] = [];
	day.allEvents.map((event: EventClass) => {
		if (event.entityConfig.icon && event.entityConfig.icon.length > 0) {
			const index = myIcons.findIndex((x) => x.icon == event.entityConfig.icon && x.color == event.entityConfig.color);
			if (index === -1) {
				myIcons.push({ icon: event.entityConfig.icon, color: event.entityConfig.color });
			}
		}
	});
	myIcons.map((icon) => {
		const dayIcon = html`<span>
			<ha-icon icon="${icon.icon}" class="calIcon" style="color: ${icon.color};" ></ha-icon>
		</span>`;

		allIcons.push(dayIcon);
	});

	return allIcons;
}

// generate Calendar title
export function getCalendarTitleHTML(config: atomicCardConfig, event: EventClass) {
	const titleColor: string =
		typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : config.eventTitleColor;
	const textDecoration: string = event.isDeclined ? 'line-through' : 'none';
	let { title } = event;

	if (!isHtml(event.title) && config.titleLength && event.title.length > config.titleLength) {
		title = event.title.slice(0, config.titleLength);
	}

	if (config.disableCalEventLink || event.htmlLink === null) {
		return html`<span style="text-decoration: ${textDecoration};color: ${titleColor}">${title} ${getMultiDayEventParts(config, event)}</span>`;
	} else {
		return html`<a
  			href="${event.htmlLink}"
  			style="text-decoration: ${textDecoration};color: ${titleColor}"
  			target="${config.linkTarget}"
  			>${title} ${getMultiDayEventParts(config, event)}
  		</a>`;
	}
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
			description = unsafeHTML(event.description);
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
