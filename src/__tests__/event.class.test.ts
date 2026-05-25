import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ENTITY, allDayEvent, makeConfig, timedEvent } from './fixtures';
import EventClass, { applyTitleReplace } from '../lib/event.class';

const NOW = '2026-04-25T12:00:00';

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('EventClass: time getters', () => {
	test('startDateTime / endDateTime parsed from dateTime', () => {
		const e = new EventClass(timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00'), makeConfig());
		expect(e.startDateTime.format()).toBe(dayjs('2026-04-25T14:00:00').format());
		expect(e.endDateTime.format()).toBe(dayjs('2026-04-25T15:00:00').format());
	});

	test('all-day event end is shifted back one day to be inclusive', () => {
		const e = new EventClass(allDayEvent('2026-04-25', '2026-04-26'), makeConfig());
		expect(e.startDateTime.isSame(dayjs('2026-04-25').startOf('day'))).toBe(true);
		expect(e.endDateTime.isSame(dayjs('2026-04-25').endOf('day'))).toBe(true);
	});
});

describe('EventClass: predicates', () => {
	test('isRunning is true for events spanning now', () => {
		const e = new EventClass(timedEvent('2026-04-25T11:00:00', '2026-04-25T13:00:00'), makeConfig());
		expect(e.isRunning).toBe(true);
		expect(e.isFinished).toBe(false);
	});

	test('isFinished is true for events that ended before now', () => {
		const e = new EventClass(timedEvent('2026-04-25T08:00:00', '2026-04-25T09:00:00'), makeConfig());
		expect(e.isFinished).toBe(true);
		expect(e.isRunning).toBe(false);
	});

	test('isRunning false for future events', () => {
		const e = new EventClass(timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00'), makeConfig());
		expect(e.isRunning).toBe(false);
		expect(e.isFinished).toBe(false);
	});

	test('isAllDayEvent for date-only payload', () => {
		const e = new EventClass(allDayEvent('2026-04-25', '2026-04-26'), makeConfig());
		expect(e.isAllDayEvent).toBe(true);
	});

	test('isAllDayEvent false for dateTime payload', () => {
		const e = new EventClass(timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00'), makeConfig());
		expect(e.isAllDayEvent).toBe(false);
	});

	test('isMultiDay true for events crossing midnight by > 24h', () => {
		const e = new EventClass(timedEvent('2026-04-25T10:00:00', '2026-04-27T10:00:00'), makeConfig());
		expect(e.isMultiDay).toBe(true);
	});

	test('isMultiDay false for events ending exactly at midnight of next day', () => {
		const e = new EventClass(timedEvent('2026-04-25T10:00:00', '2026-04-26T00:00:00'), makeConfig());
		expect(e.isMultiDay).toBe(false);
	});

	test('isDeclined true when self attendee declined', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Declined Event', {
			attendees: [{ self: true, responseStatus: 'declined' }],
		});
		const e = new EventClass(raw, makeConfig());
		expect(e.isDeclined).toBe(true);
	});

	test('isDeclined false when no attendees', () => {
		const e = new EventClass(timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00'), makeConfig());
		expect(e.isDeclined).toBe(false);
	});
});

describe('EventClass.split (mode-agnostic)', () => {
	test('returns every partial day for the event span', () => {
		const e = new EventClass(timedEvent('2026-04-25T10:00:00', '2026-04-28T10:00:00'), makeConfig());
		const parts = e.split();
		// 72h span rounds to 4 days via endOf('day') diff. Pinning current behavior.
		expect(parts).toHaveLength(4);
		expect(parts[0].rawEvent._isFirstDay).toBe(true);
		expect(parts[parts.length - 1].rawEvent._isLastDay).toBe(true);
	});

	test('does not filter — visibility window is caller responsibility', () => {
		// Even with a tight maxDaysToShow, split() returns all partials.
		// Filtering happens in the pipeline.
		const cfg = makeConfig({ maxDaysToShow: 2, startDaysAhead: 0 });
		const e = new EventClass(timedEvent('2026-04-25T10:00:00', '2026-04-29T10:00:00'), cfg);
		const parts = e.split();
		expect(parts.length).toBeGreaterThan(2);
	});
});

describe('EventClass: title fallback', () => {
	test('falls back to entityConfig.eventTitle when summary missing', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', '');
		raw.summary = undefined;
		raw.entity = { entity: 'calendar.test', eventTitle: 'Untitled From Entity' };
		const e = new EventClass(raw, makeConfig());
		expect(e.title).toBe('Untitled From Entity');
	});

	test('falls back to global eventTitle when neither summary nor entity title', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', '');
		raw.summary = undefined;
		const e = new EventClass(raw, makeConfig({ eventTitle: 'Global Default' }));
		expect(e.title).toBe('Global Default');
	});
});

// #1395 / #1599 / #1605: per-entity title rewrite rules.
describe('EventClass: titleReplace', () => {
	test('strips a literal prefix when "to" is empty', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Dinner = Sushi', {
			entity: { ...ENTITY, titleReplace: [{ from: '^Dinner = ', to: '' }] },
		});
		const e = new EventClass(raw, makeConfig());
		expect(e.title).toBe('Sushi');
	});

	test('renames matching titles', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Daddy Work', {
			entity: { ...ENTITY, titleReplace: [{ from: 'Daddy Work', to: 'Work' }] },
		});
		const e = new EventClass(raw, makeConfig());
		expect(e.title).toBe('Work');
	});

	test('multiple rules apply in order', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Birthday Grandpa', {
			entity: {
				...ENTITY,
				titleReplace: [
					{ from: '^Birthday ', to: '' },
					{ from: 'Grandpa', to: 'Opa' },
				],
			},
		});
		const e = new EventClass(raw, makeConfig());
		expect(e.title).toBe('Opa');
	});

	test('case-insensitive match', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'STEVE hat Geburtstag', {
			entity: { ...ENTITY, titleReplace: [{ from: ' hat Geburtstag$', to: '' }] },
		});
		const e = new EventClass(raw, makeConfig());
		expect(e.title).toBe('STEVE');
	});

	test('invalid regex rule is skipped, other rules still apply', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Foo Bar', {
			entity: { ...ENTITY, titleReplace: [{ from: '[invalid', to: 'X' }, { from: 'Bar', to: 'Baz' }] },
		});
		const e = new EventClass(raw, makeConfig());
		expect(e.title).toBe('Foo Baz');
	});

	test('rawTitle is unchanged so blocklist/allowlist can match the original', () => {
		const raw = timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Dinner = Sushi', {
			entity: { ...ENTITY, titleReplace: [{ from: '^Dinner = ', to: '' }] },
		});
		const e = new EventClass(raw, makeConfig());
		expect(e.rawTitle).toBe('Dinner = Sushi');
		expect(e.title).toBe('Sushi');
	});

	test('applyTitleReplace is a no-op without rules', () => {
		expect(applyTitleReplace('Hello', undefined)).toBe('Hello');
		expect(applyTitleReplace('Hello', [])).toBe('Hello');
	});
});
