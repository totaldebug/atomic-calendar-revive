import defaultConfig from '../defaults';
import localize from '../localize/localize';
import { atomicCardConfig } from '../types/config';

const VALID_MODES = ['Event', 'Calendar', 'Planner', 'Inline'] as const;
const VALID_SORT_BY = ['start', 'milestone'] as const;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function fail(message: string): never {
	throw new Error(`${localize('errors.invalid_configuration')}: ${message}`);
}

function assertValidRegex(value: unknown, fieldPath: string): void {
	if (value === undefined || value === '') return;
	if (typeof value !== 'string') {
		fail(`${fieldPath} must be a string regex pattern`);
	}
	try {
		new RegExp(value as string);
	} catch (err) {
		fail(`${fieldPath} is not a valid regex: ${(err as Error).message}`);
	}
}

function assertValidTime(value: unknown, fieldPath: string): void {
	if (value === undefined || value === '') return;
	if (typeof value !== 'string' || !TIME_RE.test(value)) {
		fail(`${fieldPath} must be in HH:mm format (00:00 - 23:59), got: ${String(value)}`);
	}
}

function assertNonNegativeInt(value: unknown, fieldPath: string): void {
	if (value === undefined) return;
	if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
		fail(`${fieldPath} must be a non-negative integer, got: ${String(value)}`);
	}
}

function assertInteger(value: unknown, fieldPath: string): void {
	if (value === undefined) return;
	if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
		fail(`${fieldPath} must be an integer, got: ${String(value)}`);
	}
}

function assertEnum<T extends string>(value: unknown, allowed: readonly T[], fieldPath: string): void {
	if (value === undefined) return;
	if (typeof value !== 'string' || !allowed.includes(value as T)) {
		fail(`${fieldPath} must be one of ${allowed.join(', ')}, got: ${String(value)}`);
	}
}

function coerceEntity(entity: unknown, index: number): { entity: string; [k: string]: unknown } {
	if (typeof entity === 'string') {
		return { entity };
	}
	if (entity && typeof entity === 'object' && typeof (entity as { entity?: unknown }).entity === 'string') {
		return entity as { entity: string };
	}
	fail(`entities[${index}] must be a string entity_id or an object with an 'entity' field`);
}

function validateEntity(entity: { entity: string; [k: string]: unknown }, index: number): void {
	const path = `entities[${index}]`;
	assertValidRegex(entity.blocklist, `${path}.blocklist`);
	assertValidRegex(entity.allowlist, `${path}.allowlist`);
	assertValidRegex(entity.blocklistLocation, `${path}.blocklistLocation`);
	assertValidRegex(entity.allowlistLocation, `${path}.allowlistLocation`);
	assertValidTime(entity.startTimeFilter, `${path}.startTimeFilter`);
	assertValidTime(entity.endTimeFilter, `${path}.endTimeFilter`);
	assertNonNegativeInt(entity.maxDaysToShow, `${path}.maxDaysToShow`);
}

/**
 * Validates and normalizes a card config from setConfig().
 * Throws Error with a descriptive message on any invalid input.
 * Returns a config with defaults merged and entities coerced to object form.
 */
export function resolveConfig(raw: atomicCardConfig | undefined): atomicCardConfig {
	if (!raw) {
		throw new Error(localize('errors.invalid_configuration'));
	}
	if (!raw.entities || (Array.isArray(raw.entities) && raw.entities.length === 0)) {
		throw new Error(localize('errors.no_entities'));
	}

	const customConfig: atomicCardConfig = JSON.parse(JSON.stringify(raw));
	const merged = { ...defaultConfig, ...customConfig } as atomicCardConfig;

	if (typeof merged.entities === 'string') {
		merged.entities = [{ entity: merged.entities }];
	} else if (!Array.isArray(merged.entities)) {
		fail('entities must be an array');
	}

	merged.entities = merged.entities.map((e: unknown, i: number) => {
		const coerced = coerceEntity(e, i);
		validateEntity(coerced, i);
		return coerced;
	});

	assertNonNegativeInt(merged.maxDaysToShow, 'maxDaysToShow');
	assertNonNegativeInt(merged.maxEventCount, 'maxEventCount');
	assertNonNegativeInt(merged.softLimit, 'softLimit');
	assertNonNegativeInt(merged.plannerDaysToShow, 'plannerDaysToShow');
	assertNonNegativeInt(merged.refreshInterval, 'refreshInterval');
	assertInteger(merged.startDaysAhead, 'startDaysAhead');

	if (merged.firstDayOfWeek !== undefined) {
		if (
			typeof merged.firstDayOfWeek !== 'number' ||
			!Number.isInteger(merged.firstDayOfWeek) ||
			merged.firstDayOfWeek < 0 ||
			merged.firstDayOfWeek > 6
		) {
			fail(`firstDayOfWeek must be 0-6 (0=Sunday, 1=Monday, ...), got: ${String(merged.firstDayOfWeek)}`);
		}
	}

	assertEnum(merged.defaultMode, VALID_MODES, 'defaultMode');
	assertEnum(merged.sortBy, VALID_SORT_BY, 'sortBy');

	return merged;
}
