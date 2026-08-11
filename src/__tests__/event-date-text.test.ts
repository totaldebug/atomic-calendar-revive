import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { makeConfig } from './fixtures';
import { setLanguage } from '../helpers/globals';
import { getEventDateText } from '../lib/common.html';

// Discussion #1815: an opt-in `showTodayTomorrow` option substitutes a localized
// "Today"/"Tomorrow" label for events falling on those two days, while every other
// day keeps the configured `eventDateFormat`.

beforeEach(() => {
	setLanguage(null);
	localStorage.clear();
});

afterEach(() => {
	setLanguage(null);
	localStorage.clear();
});

describe('getEventDateText', () => {
	test('uses the localized "Today" label for today when enabled', () => {
		const config = makeConfig({ showTodayTomorrow: true });
		expect(getEventDateText(config, dayjs().startOf('day'))).toBe('Today');
	});

	test('uses the localized "Tomorrow" label for tomorrow when enabled', () => {
		const config = makeConfig({ showTodayTomorrow: true });
		expect(getEventDateText(config, dayjs().add(1, 'day').startOf('day'))).toBe('Tomorrow');
	});

	test('falls back to eventDateFormat for days beyond tomorrow', () => {
		const config = makeConfig({ showTodayTomorrow: true, eventDateFormat: 'ddd D MMM' });
		const inThreeDays = dayjs().add(3, 'day').startOf('day');
		expect(getEventDateText(config, inThreeDays)).toBe(inThreeDays.format('ddd D MMM'));
	});

	test('always uses eventDateFormat when the option is disabled', () => {
		const config = makeConfig({ showTodayTomorrow: false, eventDateFormat: 'ddd D MMM' });
		const today = dayjs().startOf('day');
		expect(getEventDateText(config, today)).toBe(today.format('ddd D MMM'));
	});

	test('honours the configured language for the relative labels', () => {
		setLanguage('de');
		const config = makeConfig({ showTodayTomorrow: true });
		expect(getEventDateText(config, dayjs().startOf('day'))).toBe('Heute');
		expect(getEventDateText(config, dayjs().add(1, 'day').startOf('day'))).toBe('Morgen');
	});

	test('matches today regardless of the time of day', () => {
		const config = makeConfig({ showTodayTomorrow: true });
		// Late-in-the-day timestamp must still be recognised as "today".
		expect(getEventDateText(config, dayjs().endOf('day'))).toBe('Today');
	});
});
