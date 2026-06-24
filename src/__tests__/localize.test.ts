import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { globalData, setHass, setLanguage } from '../helpers/globals';
import localize from '../localize/localize';

beforeEach(() => {
	// Reset shared global state between tests.
	setHass(null as never);
	setLanguage(null);
	localStorage.clear();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('localize: language resolution', () => {
	test('falls back to English when nothing is configured', () => {
		// "common.fullDayEventText" exists in en.json.
		expect(localize('common.fullDayEventText')).toBe('All Day');
	});

	test('honours the card-configured language', () => {
		setLanguage('sk');
		// Differs from the English string, proving sk.json is used.
		expect(localize('common.fullDayEventText')).not.toBe('All Day');
	});

	test('configured language wins over hass locale', () => {
		setHass({ locale: { language: 'fr' }, language: 'fr' } as never);
		setLanguage('sk');
		expect(globalData.language).toBe('sk');
		const sk = localize('common.fullDayEventText');
		setLanguage('fr');
		expect(localize('common.fullDayEventText')).not.toBe(sk);
	});

	test('does not warn for the literal string "null" in localStorage (#1782)', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		localStorage.setItem('selectedLanguage', 'null');
		expect(localize('common.fullDayEventText')).toBe('All Day');
		expect(warn).not.toHaveBeenCalled();
	});

	test('does not warn when no language source is set', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		localize('common.fullDayEventText');
		expect(warn).not.toHaveBeenCalled();
	});

	test('warns once for a genuinely unsupported language', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		setLanguage('xx');
		expect(localize('common.fullDayEventText')).toBe('All Day');
		expect(warn).toHaveBeenCalled();
	});
});
