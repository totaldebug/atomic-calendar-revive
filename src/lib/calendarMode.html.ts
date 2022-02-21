import { handleClick, HomeAssistant } from "custom-card-helpers";
import dayjs from "dayjs";
import isoWeek from 'dayjs/plugin/isoWeek';
import { html } from 'lit';
import { atomicCardConfig } from "../types";
import CalendarDay from "./calendar.class";
import EventClass from "./event.class";

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
				<ha-icon class="calIcon" style="color:  ${icon.color};" icon="${icon.icon}"></ha-icon>
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

	if (config.disableCalEventLink || event.htmlLink === null)
		return html`<span
				style="text-decoration: ${textDecoration};color: ${titleColor}"
				>${event.title}
			</span>`;
	else
		return html`<a
				href="${event.htmlLink}"
				style="text-decoration: ${textDecoration};color: ${titleColor}"
				target="${config.linkTarget}"
				>${event.title}
			</a>`;
}

/**
 * Gets the calendar description and wraps in html
 * @param config calendar card configuration
 * @param event event record
 * @returns html description
 */
export function getCalendarDescriptionHTML(config: atomicCardConfig, event: EventClass) {
	if (event.description) {
		var desc = event.description
		if (config.descLength && event.description.length > config.descLength) {
			var desc = event.description.slice(0, config.descLength)
		}
		return html`<div class="calDescription" style="--description-color: ${config.descColor}; --description-size: ${config.descSize}%">- ${desc}</div>`;
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
				<a href=${location} target="${config.linkTarget}" class="location-link" style="--location-link-size: ${config.locationTextSize}%">
					<ha-icon class="event-location-icon" style="--location-icon-color: ${config.locationIconColor}" icon="mdi:map-marker"></ha-icon>&nbsp;
				</a>
			`;
	}
}
