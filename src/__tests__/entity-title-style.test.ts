import { describe, expect, test } from 'vitest';

import { entityTitleStyle } from '../lib/common.html';

// #1617 / #1620: per-entity font-size and font-weight on event titles. The
// helper output ends up as inline style on every event-title element, so its
// format is a public surface that card_mod users can rely on.

describe('entityTitleStyle', () => {
	test('emits font-size in px for numeric values', () => {
		expect(entityTitleStyle({ fontSize: 18 })).toBe('font-size: 18px;');
	});

	test('passes string fontSize through verbatim', () => {
		expect(entityTitleStyle({ fontSize: '120%' })).toBe('font-size: 120%;');
		expect(entityTitleStyle({ fontSize: '1.1em' })).toBe('font-size: 1.1em;');
	});

	test('emits font-weight for numeric or string values', () => {
		expect(entityTitleStyle({ fontWeight: 700 })).toBe('font-weight: 700;');
		expect(entityTitleStyle({ fontWeight: 'bold' })).toBe('font-weight: bold;');
	});

	test('combines fontSize and fontWeight separated by semicolon', () => {
		expect(entityTitleStyle({ fontSize: '110%', fontWeight: 'bold' })).toBe('font-size: 110%; font-weight: bold;');
	});

	test('returns empty when nothing is set', () => {
		expect(entityTitleStyle({})).toBe('');
		expect(entityTitleStyle({ fontSize: '' })).toBe('');
	});
});
