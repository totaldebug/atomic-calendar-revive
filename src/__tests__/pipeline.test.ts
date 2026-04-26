import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ENTITY, allDayEvent, makeConfig, timedEvent } from './fixtures';
import { groupEventsByDay, processEvents } from '../lib/pipeline';

const NOW = '2026-04-25T12:00:00';

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('processEvents: filters', () => {
	test('passes through events with no filters set', () => {
		const cfg = makeConfig({ maxDaysToShow: 7 });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'A'),
			timedEvent('2026-04-26T14:00:00', '2026-04-26T15:00:00', 'B'),
		];
		const [events, hidden] = processEvents(raw, cfg, 'Event');
		expect(events).toHaveLength(2);
		expect(hidden).toBe(0);
	});

	test('blocklist removes matching titles', () => {
		const cfg = makeConfig({ maxDaysToShow: 7 });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Standup', {
				entity: { ...ENTITY, blocklist: '^Standup$' },
			}),
			timedEvent('2026-04-25T16:00:00', '2026-04-25T17:00:00', 'Lunch', {
				entity: { ...ENTITY, blocklist: '^Standup$' },
			}),
		];
		const [events] = processEvents(raw, cfg, 'Event');
		expect(events.map((e: { title: string }) => e.title)).toEqual(['Lunch']);
	});

	test('allowlist keeps only matching titles', () => {
		const cfg = makeConfig({ maxDaysToShow: 7 });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Important: A', {
				entity: { ...ENTITY, allowlist: '^Important' },
			}),
			timedEvent('2026-04-25T16:00:00', '2026-04-25T17:00:00', 'Trivia', {
				entity: { ...ENTITY, allowlist: '^Important' },
			}),
		];
		const [events] = processEvents(raw, cfg, 'Event');
		expect(events.map((e: { title: string }) => e.title)).toEqual(['Important: A']);
	});

	test('declined events filtered when showDeclined=false', () => {
		const cfg = makeConfig({ maxDaysToShow: 7, showDeclined: false });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'A', {
				attendees: [{ self: true, responseStatus: 'declined' }],
			}),
			timedEvent('2026-04-25T16:00:00', '2026-04-25T17:00:00', 'B'),
		];
		const [events] = processEvents(raw, cfg, 'Event');
		expect(events.map((e: { title: string }) => e.title)).toEqual(['B']);
	});

	test('all-day events filtered when showAllDayEvents=false', () => {
		const cfg = makeConfig({ maxDaysToShow: 7, showAllDayEvents: false });
		const raw = [
			allDayEvent('2026-04-25', '2026-04-26', 'AllDay'),
			timedEvent('2026-04-25T16:00:00', '2026-04-25T17:00:00', 'Timed'),
		];
		const [events] = processEvents(raw, cfg, 'Event');
		expect(events.map((e: { title: string }) => e.title)).toEqual(['Timed']);
	});

	test('finished events filtered when hideFinishedEvents=true', () => {
		const cfg = makeConfig({ maxDaysToShow: 7, hideFinishedEvents: true });
		const raw = [
			timedEvent('2026-04-25T08:00:00', '2026-04-25T09:00:00', 'Finished'),
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Future'),
		];
		const [events] = processEvents(raw, cfg, 'Event');
		expect(events.map((e: { title: string }) => e.title)).toEqual(['Future']);
	});

	test('maxEventCount trims and reports hidden', () => {
		const cfg = makeConfig({ maxDaysToShow: 7, maxEventCount: 2 });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'A'),
			timedEvent('2026-04-26T14:00:00', '2026-04-26T15:00:00', 'B'),
			timedEvent('2026-04-27T14:00:00', '2026-04-27T15:00:00', 'C'),
			timedEvent('2026-04-28T14:00:00', '2026-04-28T15:00:00', 'D'),
		];
		const [events, hidden] = processEvents(raw, cfg, 'Event');
		expect(events).toHaveLength(2);
		expect(hidden).toBe(2);
	});

	test('softLimit allows overflow up to maxEventCount + softLimit', () => {
		const cfg = makeConfig({ maxDaysToShow: 7, maxEventCount: 2, softLimit: 2 });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'A'),
			timedEvent('2026-04-26T14:00:00', '2026-04-26T15:00:00', 'B'),
			timedEvent('2026-04-27T14:00:00', '2026-04-27T15:00:00', 'C'),
			timedEvent('2026-04-28T14:00:00', '2026-04-28T15:00:00', 'D'),
		];
		const [events, hidden] = processEvents(raw, cfg, 'Event');
		// 4 events, maxEventCount=2, softLimit=2, threshold = 2+2 = 4. 4 > 4 is false, so no trim.
		expect(events).toHaveLength(4);
		expect(hidden).toBe(0);
	});

	test('hideDuplicates merges by title|start|end and joins origin names', () => {
		const cfg = makeConfig({ maxDaysToShow: 7, hideDuplicates: true });
		const e1 = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Sync', {
			entity: { entity: 'calendar.a', name: 'Calendar A' },
		});
		const e2 = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Sync', {
			entity: { entity: 'calendar.b', name: 'Calendar B' },
		});
		const cfgWithBoth = makeConfig({
			maxDaysToShow: 7,
			hideDuplicates: true,
			entities: [
				{ entity: 'calendar.a', name: 'Calendar A' },
				{ entity: 'calendar.b', name: 'Calendar B' },
			],
		});
		const [events] = processEvents([e1, e2], cfgWithBoth, 'Event');
		expect(events).toHaveLength(1);
		expect(events[0].originName).toContain('Calendar A');
		expect(events[0].originName).toContain('Calendar B');
		void cfg;
	});

	test('multiday split applied when showMultiDay=true', () => {
		const cfg = makeConfig({ maxDaysToShow: 7, showMultiDay: true });
		const raw = [timedEvent('2026-04-25T10:00:00', '2026-04-27T10:00:00', 'Trip')];
		const [events] = processEvents(raw, cfg, 'Event');
		expect(events.length).toBeGreaterThan(1);
	});

	test('Calendar mode does not apply maxDaysToShow window filter', () => {
		const cfg = makeConfig({ maxDaysToShow: 1 });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Today'),
			timedEvent('2026-05-15T14:00:00', '2026-05-15T15:00:00', 'FarFuture'),
		];
		const [events] = processEvents(raw, cfg, 'Calendar');
		expect(events).toHaveLength(2);
	});

	test('Event mode applies maxDaysToShow window filter', () => {
		const cfg = makeConfig({ maxDaysToShow: 2, startDaysAhead: 0 });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Today'),
			timedEvent('2026-04-26T14:00:00', '2026-04-26T15:00:00', 'Tomorrow'),
			timedEvent('2026-04-30T14:00:00', '2026-04-30T15:00:00', 'TooFar'),
		];
		const [events] = processEvents(raw, cfg, 'Event');
		expect(events.map((e: { title: string }) => e.title)).not.toContain('TooFar');
	});

	test('startTimeFilter / endTimeFilter restrict to time-of-day window', () => {
		const cfg = makeConfig({ maxDaysToShow: 7 });
		const inWindow = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'In', {
			entity: { ...ENTITY, startTimeFilter: '13:00', endTimeFilter: '17:00' },
		});
		const outWindow = timedEvent('2026-04-25T22:00:00', '2026-04-25T23:00:00', 'Out', {
			entity: { ...ENTITY, startTimeFilter: '13:00', endTimeFilter: '17:00' },
		});
		const [events] = processEvents([inWindow, outWindow], cfg, 'Event');
		expect(events.map((e: { title: string }) => e.title)).toEqual(['In']);
	});
});

describe('groupEventsByDay', () => {
	test('groups by daysToSort key', () => {
		const cfg = makeConfig({ maxDaysToShow: 7 });
		const raw = [
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'A'),
			timedEvent('2026-04-25T16:00:00', '2026-04-25T17:00:00', 'B'),
			timedEvent('2026-04-26T14:00:00', '2026-04-26T15:00:00', 'C'),
		];
		const [events] = processEvents(raw, cfg, 'Event');
		const groups = groupEventsByDay(events);
		expect(groups).toHaveLength(2);
		expect(groups[0]).toHaveLength(2);
		expect(groups[1]).toHaveLength(1);
	});
});
