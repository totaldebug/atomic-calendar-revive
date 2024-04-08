/* eslint-disable import/no-named-as-default-member */
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import CalendarDay from './calendar.class';
import { isHtml } from './common.html';
import EventClass from './event.class';
import { getEntityIcon } from '../helpers/get-icon';
import { atomicCardConfig } from '../types/config';
import { HomeAssistant } from '../types/homeassistant';

dayjs.extend(isoWeek);

/**
 * Checks which calendar icons are required, and adds the icon once
 * to an array that is then displayed in the cell for that day
 * @param day calendarDay
 * @returns mdi icons required for that day
 */
export function handleCalendarIcons(day: CalendarDay, hass: HomeAssistant) {
	const allIcons: any[] = [];
	const myIcons: any[] = [];
	day.allEvents.map((event: EventClass) => {
		let { icon } = event.entityConfig;
		if (!icon || icon.length === 0) {
			// If icon is not set or is an empty string, use getEntityIcon as a fallback
			icon = getEntityIcon(event.entity.entity_id, hass);
		}

		const index = myIcons.findIndex((x) => x.icon === icon && x.color === event.entityConfig.color);
		if (index === -1) {
			myIcons.push({ icon, color: event.entityConfig.color });
		}
	});
	// Sort myIcons alphabetically by icon property
	myIcons.sort((a, b) => a.icon.localeCompare(b.icon));

	myIcons.map((icon) => {
		const dayIcon = html`<span>
			<ha-icon icon="${icon.icon}" class="calIcon" style="color: ${icon.color};"></ha-icon>
		</span>`;

		allIcons.push(dayIcon);
	});

	return allIcons;
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
	} else {
		return html`;`;
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
