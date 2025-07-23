// src/lib/weekMode.html.ts

import { html } from 'lit';
import dayjs, { Dayjs } from 'dayjs'; // Import Dayjs type
import EventClass from './event.class';
import { atomicCardConfig } from '../types/config';
// No longer need HomeAssistant, so it has been removed.

function renderWeekEvent(event: EventClass) {
	// FIX 1: The property is 'isAllDayEvent', not 'isAllDay'.
	const time = event.isAllDayEvent ? 'All Day' : `${event.startDateTime.format('LT')}`;
	return html`
		<div class="week-event" style="background-color: ${event.entityConfig.color}" title="${event.title} - ${time}">
			${event.title}
		</div>
	`;
}

// FIX 2: Removed the 'hass' parameter as it was unused.
export function getWeekViewHTML(config: atomicCardConfig, allEvents: EventClass[]) {
	// FIX 3: Provide default values for optional configs to ensure they are numbers.
	const daysToShow = config.maxDaysToShow ?? 7;
	const startDaysAhead = config.startDaysAhead ?? 0;

	const startDate = dayjs().add(startDaysAhead, 'day');

	// FIX 4: Explicitly type the 'days' array to resolve the 'unknown' type error.
	const days: Dayjs[] = Array.from({ length: daysToShow }, (_, i) => startDate.add(i, 'day'));

	const header = html`
		<div class="week-view-header-row">
			<div class="week-view-header-calendar">Calendar</div>
			${days.map((day) => html`<div class="week-view-header-day">${day.format('ddd DD/MM')}</div>`)}
		</div>
	`;

	const calendarRows = config.entities.map((entityConfig) => {
		const calendarName = entityConfig.name || entityConfig.entity;
		const calendarEvents = allEvents.filter((e) => e.entityConfig.entity === entityConfig.entity);

		return html`
			<div class="week-view-calendar-row">
				<div class="week-view-calendar-name">${calendarName}</div>
				<div class="week-view-days-grid">
					${days.map((day) => {
						// The 'day' variable is now correctly typed as Dayjs.
						const dayEvents = calendarEvents.filter((e) => dayjs(e.startDateTime).isSame(day, 'day'));
						return html` <div class="week-view-day">${dayEvents.map((event) => renderWeekEvent(event))}</div> `;
					})}
				</div>
			</div>
		`;
	});

	return html`${header}${calendarRows}`;
}
