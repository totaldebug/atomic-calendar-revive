import dayjs from 'dayjs';
import EventClass from '../lib/event.class';

// Function to sort events
export default function sortEvents(events, config) {
	const currentDateTime = dayjs(); // Current date and time

	events.sort((a, b) => {
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

	// Sort all-day events by entity and title
	const allDayEvents = events.filter((event) => event.isAllDay);

	allDayEvents.sort((a, b) => {
		if (a.entity !== b.entity) {
			return a.entity.localeCompare(b.entity);
		} else {
			return a.title.localeCompare(b.title);
		}
	});

	// Combine sorted all-day and non-all-day events
	const sortedEvents = [...events];

	// Create an array to store the all day events.
	const allDayEventsArray: EventClass[] = [];

	// Iterate over the sorted events array and move all of the all day events to the allDayEvents array.
	sortedEvents.forEach((event: EventClass, index) => {
		if (event.isAllDayEvent) {
			allDayEventsArray.push(event);
			sortedEvents.splice(index, 1);
		}
	});

	// If config.allDayBottom is true, add the all day events to the end of the sorted events array.
	if (config.allDayBottom) {
		sortedEvents.push(...allDayEventsArray);
	}

	// Otherwise, add the all day events to the beginning of the sorted events array.
	else {
		sortedEvents.unshift(...allDayEventsArray);
	}


	if (config.sortBy === 'milestone') {
		// Move finished events to the bottom when sorting by milestone
		sortedEvents.sort((a, b) => {
			if (a.isFinished !== b.isFinished) {
				return a.isFinished ? 1 : -1;
			}
			return 0;
		});
	}
	return sortedEvents;
}
