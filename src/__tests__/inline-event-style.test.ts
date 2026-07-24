import { describe, expect, test } from 'vitest';

import { ENTITY, allDayEvent, makeConfig, timedEvent } from './fixtures';
import EventClass from '../lib/event.class';
import { resolveInlineEventStyle } from '../lib/views/InlineCalendarView';

// #1794: in Inline mode the all-day bar's background used to default to the same
// token as its text (both var(--primary-text-color)), making the event invisible
// whenever no per-calendar color: was configured. The fill must never resolve to
// the text color.

describe('resolveInlineEventStyle', () => {
	test('all-day event with no custom color uses accent fill and contrast text', () => {
		const config = makeConfig();
		const event = new EventClass(allDayEvent('2026-04-25', '2026-04-26'), config);
		const { background, textColor } = resolveInlineEventStyle(event, config);
		expect(background).toBe('var(--primary-color)');
		expect(textColor).toBe('var(--text-primary-color)');
		// The regression: fill must not equal the text color.
		expect(background).not.toBe(textColor);
		// The root cause was both defaulting to defaultCalColor; assert neither does now.
		expect(background).not.toBe(config.defaultCalColor);
		expect(textColor).not.toBe(config.defaultCalColor);
	});

	test('all-day event honours a per-calendar color as the fill', () => {
		const coloredEntity = { ...ENTITY, color: '#ff0000' };
		const event = new EventClass(
			allDayEvent('2026-04-25', '2026-04-26', 'AllDay', { entity: coloredEntity }),
			makeConfig(),
		);
		const { background, textColor } = resolveInlineEventStyle(event, makeConfig());
		expect(background).toBe('#ff0000');
		expect(textColor).toBe('var(--text-primary-color)');
	});

	test('timed event with no custom color has no fill and defaultCalColor text', () => {
		const event = new EventClass(timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00'), makeConfig());
		const config = makeConfig();
		const { background, textColor } = resolveInlineEventStyle(event, config);
		expect(background).toBe('');
		expect(textColor).toBe(config.defaultCalColor);
	});

	test('timed event honours a per-calendar color as the text color', () => {
		const coloredEntity = { ...ENTITY, color: '#00ff00' };
		const event = new EventClass(
			timedEvent('2026-04-25T14:00:00', '2026-04-25T15:00:00', 'Meeting', { entity: coloredEntity }),
			makeConfig(),
		);
		const { background, textColor } = resolveInlineEventStyle(event, makeConfig());
		expect(background).toBe('');
		expect(textColor).toBe('#00ff00');
	});
});
