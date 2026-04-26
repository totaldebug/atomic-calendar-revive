import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { allDayEvent, makeConfig, timedEvent } from './fixtures';
import sortEvents from '../common/sort_events';
import EventClass from '../lib/event.class';

dayjs.extend(isBetween);

const NOW = '2026-04-25T12:00:00';

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
	vi.useRealTimers();
});

function build(raw: any[]) {
	return raw.map((r) => new EventClass(r, makeConfig()));
}

describe('sortEvents', () => {
	test('sortBy=start orders within the day by start time', () => {
		const events = build([
			timedEvent('2026-04-25T16:00:00', '2026-04-25T17:00:00', 'Late'),
			timedEvent('2026-04-25T10:00:00', '2026-04-25T11:00:00', 'Early'),
		]);
		const sorted = sortEvents(events, makeConfig({ sortBy: 'start' }));
		expect(sorted.map((e) => e.title)).toEqual(['Early', 'Late']);
	});

	test('all-day events render at top by default (allDayBottom=false)', () => {
		const events = build([
			timedEvent('2026-04-25T10:00:00', '2026-04-25T11:00:00', 'Timed'),
			allDayEvent('2026-04-25', '2026-04-26', 'AllDay'),
		]);
		const sorted = sortEvents(events, makeConfig({ sortBy: 'start', allDayBottom: false }));
		expect(sorted[0].title).toBe('AllDay');
	});

	test('allDayBottom=true puts all-day events last in the day', () => {
		const events = build([
			allDayEvent('2026-04-25', '2026-04-26', 'AllDay'),
			timedEvent('2026-04-25T10:00:00', '2026-04-25T11:00:00', 'Timed'),
		]);
		const sorted = sortEvents(events, makeConfig({ sortBy: 'start', allDayBottom: true }));
		expect(sorted[sorted.length - 1].title).toBe('AllDay');
	});

	test('cross-day order preserved (each day sorted independently)', () => {
		const events = build([
			timedEvent('2026-04-26T10:00:00', '2026-04-26T11:00:00', 'D2'),
			timedEvent('2026-04-25T10:00:00', '2026-04-25T11:00:00', 'D1'),
		]);
		const sorted = sortEvents(events, makeConfig({ sortBy: 'start' }));
		expect(sorted.map((e) => e.title)).toEqual(['D1', 'D2']);
	});
});
