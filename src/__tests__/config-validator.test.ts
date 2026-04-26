import { describe, expect, test } from 'vitest';

import { resolveConfig } from '../lib/config-validator';
import { atomicCardConfig } from '../types/config';

function base(overrides: Partial<atomicCardConfig> = {}): atomicCardConfig {
	return {
		type: 'custom:atomic-calendar-revive',
		entities: [{ entity: 'calendar.test' }],
		...overrides,
	} as atomicCardConfig;
}

describe('resolveConfig: existing checks', () => {
	test('throws when config is missing', () => {
		expect(() => resolveConfig(undefined)).toThrow();
	});

	test('throws when entities is missing', () => {
		expect(() => resolveConfig({ type: 'x' } as atomicCardConfig)).toThrow();
	});

	test('throws when entities is empty', () => {
		expect(() => resolveConfig(base({ entities: [] }))).toThrow();
	});

	test('coerces a top-level string entities into an array', () => {
		const cfg = resolveConfig({ type: 'x', entities: 'calendar.test' } as unknown as atomicCardConfig);
		expect(cfg.entities).toEqual([{ entity: 'calendar.test' }]);
	});

	test('coerces string entities into objects', () => {
		const cfg = resolveConfig(
			base({ entities: ['calendar.a', 'calendar.b'] as unknown as atomicCardConfig['entities'] }),
		);
		expect(cfg.entities).toEqual([{ entity: 'calendar.a' }, { entity: 'calendar.b' }]);
	});

	test('merges defaults', () => {
		const cfg = resolveConfig(base());
		expect(cfg.maxDaysToShow).toBe(0);
		expect(cfg.firstDayOfWeek).toBe(1);
		expect(cfg.defaultMode).toBe('Event');
	});

	test('user values override defaults', () => {
		const cfg = resolveConfig(base({ maxDaysToShow: 14, firstDayOfWeek: 0, defaultMode: 'Calendar' }));
		expect(cfg.maxDaysToShow).toBe(14);
		expect(cfg.firstDayOfWeek).toBe(0);
		expect(cfg.defaultMode).toBe('Calendar');
	});
});

describe('resolveConfig: regex validation', () => {
	test('valid blocklist regex passes', () => {
		expect(() => resolveConfig(base({ entities: [{ entity: 'calendar.test', blocklist: '^Standup' }] }))).not.toThrow();
	});

	test('invalid blocklist regex throws with field path', () => {
		expect(() => resolveConfig(base({ entities: [{ entity: 'calendar.test', blocklist: '[unclosed' }] }))).toThrow(
			/blocklist/,
		);
	});

	test('invalid allowlistLocation regex throws', () => {
		expect(() =>
			resolveConfig(base({ entities: [{ entity: 'calendar.test', allowlistLocation: '*invalid' }] })),
		).toThrow(/allowlistLocation/);
	});

	test('empty regex string is allowed (treated as no filter)', () => {
		expect(() => resolveConfig(base({ entities: [{ entity: 'calendar.test', blocklist: '' }] }))).not.toThrow();
	});
});

describe('resolveConfig: time validation', () => {
	test('valid HH:mm passes', () => {
		expect(() =>
			resolveConfig(
				base({ entities: [{ entity: 'calendar.test', startTimeFilter: '09:00', endTimeFilter: '17:30' }] }),
			),
		).not.toThrow();
	});

	test('invalid time format throws', () => {
		expect(() => resolveConfig(base({ entities: [{ entity: 'calendar.test', startTimeFilter: '9am' }] }))).toThrow(
			/startTimeFilter/,
		);
	});

	test('out-of-range hours throws', () => {
		expect(() => resolveConfig(base({ entities: [{ entity: 'calendar.test', endTimeFilter: '24:00' }] }))).toThrow(
			/endTimeFilter/,
		);
	});
});

describe('resolveConfig: numeric ranges', () => {
	test('firstDayOfWeek 0-6 passes', () => {
		expect(() => resolveConfig(base({ firstDayOfWeek: 0 }))).not.toThrow();
		expect(() => resolveConfig(base({ firstDayOfWeek: 6 }))).not.toThrow();
	});

	test('firstDayOfWeek out of range throws', () => {
		expect(() => resolveConfig(base({ firstDayOfWeek: 7 }))).toThrow(/firstDayOfWeek/);
		expect(() => resolveConfig(base({ firstDayOfWeek: -1 }))).toThrow(/firstDayOfWeek/);
	});

	test('negative maxDaysToShow throws', () => {
		expect(() => resolveConfig(base({ maxDaysToShow: -1 }))).toThrow(/maxDaysToShow/);
	});

	test('non-integer maxEventCount throws', () => {
		expect(() => resolveConfig(base({ maxEventCount: 2.5 }))).toThrow(/maxEventCount/);
	});

	test('startDaysAhead can be negative (showing past events is supported)', () => {
		expect(() => resolveConfig(base({ startDaysAhead: -7 }))).not.toThrow();
	});
});

describe('resolveConfig: enum validation', () => {
	test('valid defaultMode passes', () => {
		for (const mode of ['Event', 'Calendar', 'Planner', 'Inline']) {
			expect(() => resolveConfig(base({ defaultMode: mode }))).not.toThrow();
		}
	});

	test('invalid defaultMode throws', () => {
		expect(() => resolveConfig(base({ defaultMode: 'Agenda' }))).toThrow(/defaultMode/);
	});

	test('valid sortBy passes', () => {
		expect(() => resolveConfig(base({ sortBy: 'start' }))).not.toThrow();
		expect(() => resolveConfig(base({ sortBy: 'milestone' }))).not.toThrow();
	});

	test('invalid sortBy throws', () => {
		expect(() => resolveConfig(base({ sortBy: 'random' }))).toThrow(/sortBy/);
	});
});

describe('resolveConfig: malformed entities', () => {
	test('entity object missing entity field throws', () => {
		expect(() =>
			resolveConfig(base({ entities: [{ name: 'no entity here' } as unknown as { entity: string }] })),
		).toThrow(/entities\[0\]/);
	});

	test('non-array entities throws', () => {
		expect(() => resolveConfig(base({ entities: 42 as unknown as atomicCardConfig['entities'] }))).toThrow();
	});
});
