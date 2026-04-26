import defaultConfig from '../defaults';
import { atomicCardConfig } from '../types/config';

export type RawEvent = {
	summary?: string;
	location?: string;
	description?: string;
	start: { date?: string; dateTime?: string };
	end: { date?: string; dateTime?: string };
	attendees?: Array<{ self?: boolean; responseStatus?: string }>;
	entity?: { entity: string; name?: string; [k: string]: unknown };
	calendarEntity?: string;
	hassEntity?: { attributes?: { friendly_name?: string }; entity?: string };
	id?: string;
	uid?: string;
	[k: string]: unknown;
};

export const ENTITY = { entity: 'calendar.test', name: 'Test' };

export function makeConfig(overrides: Partial<atomicCardConfig> = {}): atomicCardConfig {
	return {
		...(defaultConfig as atomicCardConfig),
		entities: [ENTITY],
		type: 'custom:atomic-calendar-revive',
		...overrides,
	};
}

export function timedEvent(start: string, end: string, summary = 'Meeting', extras: Partial<RawEvent> = {}): RawEvent {
	return {
		summary,
		start: { dateTime: start },
		end: { dateTime: end },
		entity: ENTITY,
		calendarEntity: ENTITY.entity,
		hassEntity: { attributes: { friendly_name: 'Test' }, entity: ENTITY.entity },
		...extras,
	};
}

export function allDayEvent(
	startDate: string,
	endDate: string,
	summary = 'AllDay',
	extras: Partial<RawEvent> = {},
): RawEvent {
	return {
		summary,
		start: { date: startDate },
		end: { date: endDate },
		entity: ENTITY,
		calendarEntity: ENTITY.entity,
		hassEntity: { attributes: { friendly_name: 'Test' }, entity: ENTITY.entity },
		...extras,
	};
}
