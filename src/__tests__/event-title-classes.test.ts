import { describe, expect, test } from 'vitest';

import { entitySourceClass } from '../lib/common.html';

// #1540: emit a stable `cal-<slug>` CSS class on event titles so card_mod
// users can target individual calendar sources. The slug rules are a public
// surface — assert them so theme authors can rely on them.

describe('entitySourceClass', () => {
	test('strips the calendar. prefix and slugifies the suffix', () => {
		expect(entitySourceClass('calendar.family_main')).toBe('cal-family-main');
	});

	test('lowercases mixed case and collapses non-alphanumeric to dashes', () => {
		expect(entitySourceClass('calendar.Work Email!')).toBe('cal-work-email');
	});

	test('returns empty when entity is missing', () => {
		expect(entitySourceClass(undefined)).toBe('');
		expect(entitySourceClass('')).toBe('');
	});

	test('handles non-calendar prefixes (sensor.*, etc.) by slugifying as-is', () => {
		expect(entitySourceClass('sensor.bin_day')).toBe('cal-sensor-bin-day');
	});
});
