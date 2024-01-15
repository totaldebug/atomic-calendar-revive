import { mdiCurrencyMnt } from '@mdi/js';
import dayjs from 'dayjs';

import EventClass from '../lib/event.class';

// Function to sort events
export default function sortEvents(events: EventClass[], config) {
	const currentDateTime = dayjs(); // Current date and time
	const sortedEvents: EventClass[] = [...events]; // Array to manipulate events.
	const allDayEventsArray: EventClass[] = []; // Array to store the all-day events.

	// Iterate over the events array and move all all-day events to the allDayEvents array.
	for (let i = events.length - 1; i >= 0; i--) {
		const event = events[i];
		if (event.isAllDayEvent) {
			allDayEventsArray.push(event);
			sortedEvents.splice(i, 1);
		}
	}

	// Sort the all-day events.
	allDayEventsArray.sort((a, b) => {
		// First, compare dates
		const dateComparison = a.startDateTime.diff(b.startDateTime);

		if (dateComparison !== 0) {
			return dateComparison; // If dates are different, sort by date
		} else {
			// If dates are the same, sort by title
			return a.title.localeCompare(b.title);
		}
	});

	if (config.sortBy === 'start') {
		sortedEvents.sort((a, b) => {
			const aStartDiff = a.startDateTime.diff(currentDateTime);
			const bStartDiff = b.startDateTime.diff(currentDateTime);

			if (aStartDiff <= 0 && bStartDiff <= 0) {
				// Both events have started, sort by their end times
				const aEndDiff = a.endDateTime.diff(currentDateTime);
				const bEndDiff = b.endDateTime.diff(currentDateTime);

				if (aEndDiff <= 0 && bEndDiff <= 0) {
					// Both events are ongoing, sort by their end times
					return a.endDateTime.diff(b.endDateTime);
				} else {
					// One event has finished or is ongoing, prioritize the one finishing sooner
					return aEndDiff - bEndDiff;
				}
			} else {
				// Sort by the difference between the start time and the current time
				return aStartDiff - bStartDiff;
			}
		});
	}

	if (config.sortBy === 'milestone') {
		sortedEvents.sort((a, b) => {
			const isRunningA = currentDateTime.isBetween(a.startDateTime, a.endDateTime);
			const isRunningB = currentDateTime.isBetween(b.startDateTime, b.endDateTime);

			if (isRunningA && !isRunningB) {
				return -1;
			} else if (!isRunningA && isRunningB) {
				return 1;
			} else {
				const timeDiffA = Math.min(
					Math.abs(a.startDateTime.diff(currentDateTime)),
					Math.abs(a.endDateTime.diff(currentDateTime)),
				);

				const timeDiffB = Math.min(
					Math.abs(b.startDateTime.diff(currentDateTime)),
					Math.abs(b.endDateTime.diff(currentDateTime)),
				);

				return timeDiffA - timeDiffB;
			}
		});
		// Move finished events to the bottom
		sortedEvents.sort((a, b) => {
			if (a.isFinished !== b.isFinished) {
				return a.isFinished ? 1 : -1;
			}
			// If both events are finished, sort them by their endDateTime in ascending order.
			if (a.isFinished) {
				return dayjs(a.endDateTime).isBefore(b.endDateTime) ? -1 : 1;
			}
			return 0;
		});
	}


	// If config.allDayBottom is true, add the all-day events to the end of the sorted events array.
	if (config.allDayBottom) {
		sortedEvents.push(...allDayEventsArray);
	}
	// Otherwise, add the all-day events to the beginning of the sorted events array.
	else {
		sortedEvents.unshift(...allDayEventsArray);
	}

	return sortedEvents;
}
