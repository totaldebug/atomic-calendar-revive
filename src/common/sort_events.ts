import dayjs from 'dayjs';

import EventClass from '../lib/event.class';

// Function to sort events
export default function sortEvents(events: EventClass[], config) {
	const currentDateTime = dayjs(); // Current date and time
	const sortedEvents: EventClass[] = [...events].sort((a, b) => a.startDateTime.diff(b.startDateTime)); // Array to manipulate events.

	// Step 1: Split array by startDateTime per day
	const eventsByDay: { [key: string]: EventClass[] } = {};
	sortedEvents.forEach((event) => {
		const dateKey = dayjs(event.startDateTime).format('YYYY-MM-DD');
		if (!eventsByDay[dateKey]) {
			eventsByDay[dateKey] = [];
		}
		eventsByDay[dateKey].push(event);
	});

	// Step 2: Loop through each day and sort events
	Object.values(eventsByDay).forEach((dayEvents) => {
		// 2a. Sort all-day events
		const allDayEvents = dayEvents.filter((event) => event.isAllDayEvent);
		allDayEvents.sort((a, b) => {
			if (config.allDayBottom) {
				return a.title.localeCompare(b.title); // Sort by title if at the bottom
			}
			return -a.title.localeCompare(b.title); // Sort by title in reverse if at the top
		});

		// 2b. Sort regular events by start time if sortBy = start
		if (config.sortBy === 'start') {
			dayEvents.filter((event) => !event.isAllDayEvent).sort((a, b) => a.startDateTime.diff(b.startDateTime));
		}

		// 2c. Sort regular events by milestone logic if sortBy = milestone
		if (config.sortBy === 'milestone') {
			dayEvents
				.filter((event) => !event.isAllDayEvent)
				.sort((a, b) => {
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
			dayEvents
				.filter((event) => !event.isAllDayEvent)
				.sort((a, b) => {
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

		// Step 3: Merge each day, in order, without changing the order of the events
		const sortedDay = config.allDayBottom
			? [...dayEvents.filter((event) => !event.isAllDayEvent), ...allDayEvents]
			: [...allDayEvents, ...dayEvents.filter((event) => !event.isAllDayEvent)];

		// Update eventsByDay with the sorted day
		eventsByDay[dayjs(dayEvents[0].startDateTime).format('YYYY-MM-DD')] = sortedDay;
	});

	// Step 4: Merge all days and return the whole array sorted
	return Object.values(eventsByDay).reduce((acc, dayEvents) => [...acc, ...dayEvents], []);
}
