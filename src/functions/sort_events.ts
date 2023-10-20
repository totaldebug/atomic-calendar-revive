import dayjs from 'dayjs';

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
	sortedEvents.forEach((event, index) => {
		const allDayIndex = allDayEvents.findIndex((adEvent) => adEvent.id === event.id);
		if (allDayIndex !== -1) {
			sortedEvents.splice(index, 1);
			sortedEvents.push(allDayEvents[allDayIndex]);
		}
	});

	// Apply all-day sorting based on the 'config.allDayBottom' boolean
	if (config.allDayBottom) {
		sortedEvents.sort((a, b) => b.startDateTime.diff(a.startDateTime));
	} else {
		sortedEvents.sort((a, b) => a.startDateTime.diff(b.startDateTime));
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
