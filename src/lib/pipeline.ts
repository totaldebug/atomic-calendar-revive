import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';

import EventClass from './event.class';
import sortEvents from '../common/sort_events';
import { atomicCardConfig } from '../types/config';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

export type Mode = 'Event' | 'Calendar' | 'Planner';

export interface FailedEvent {
	name: string;
	error: unknown;
}

export interface PipelineResult {
	events: EventClass[];
	hidden: number;
	failed: FailedEvent[];
}

interface DateRange {
	start: dayjs.Dayjs;
	end: dayjs.Dayjs;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

function passesAllDayBeforeWindow(e: EventClass, config: atomicCardConfig, mode: Mode): boolean {
	if (mode === 'Calendar') return true;
	if (!e.isAllDayEvent) return true;
	return !e.endDateTime.isBefore(dayjs().add(config.startDaysAhead!, 'day'));
}

function passesDeclined(e: EventClass, config: atomicCardConfig): boolean {
	return config.showDeclined ? true : !e.isDeclined;
}

function passesAllDayHidden(e: EventClass, config: atomicCardConfig): boolean {
	return config.showAllDayEvents !== false || !e.isAllDayEvent;
}

function passesRegexField(value: string | undefined, pattern: string | undefined, mode: 'block' | 'allow'): boolean {
	if (!pattern || !value) return true;
	const regex = new RegExp(pattern, 'i');
	const match = regex.test(value);
	return mode === 'block' ? !match : match;
}

function passesBlocklist(e: EventClass): boolean {
	return passesRegexField(e.title, e.entityConfig.blocklist, 'block');
}

function passesBlocklistLocation(e: EventClass): boolean {
	return passesRegexField(e.location, e.entityConfig.blocklistLocation, 'block');
}

function passesAllowlist(e: EventClass): boolean {
	const pattern = e.entityConfig.allowlist;
	if (!pattern || !e.title) return true;
	return passesRegexField(e.title, pattern, 'allow');
}

function passesAllowlistLocation(e: EventClass): boolean {
	const pattern = e.entityConfig.allowlistLocation;
	if (!pattern || !e.location) return true;
	return passesRegexField(e.location, pattern, 'allow');
}

function passesMaxDaysWindow(e: EventClass, config: atomicCardConfig, mode: Mode): boolean {
	if (mode === 'Calendar') return true;

	const entityMaxDaysToShow = e.entityConfig.maxDaysToShow;
	const baseMax = mode === 'Planner' ? config.plannerDaysToShow : config.maxDaysToShow;
	const effective = entityMaxDaysToShow !== undefined ? entityMaxDaysToShow : baseMax;
	if (effective === undefined || effective <= 0) return true;

	const daysToShow = effective - 1;
	let endLimit = dayjs().startOf('day').add(config.startDaysAhead!, 'day').add(daysToShow, 'day').endOf('day');

	if (mode === 'Planner') {
		const { start, end } = getPlannerDateRange(config);
		endLimit = entityMaxDaysToShow !== undefined ? start.add(daysToShow, 'day').endOf('day') : end;
	}

	return !e.startDateTime.isAfter(endLimit);
}

function passesTimeOfDayWindow(e: EventClass): boolean {
	const start = e.entityConfig.startTimeFilter;
	const end = e.entityConfig.endTimeFilter;
	if (!start || !end) return true;

	const [sh, sm] = start.split(':').map(Number);
	const [eh, em] = end.split(':').map(Number);
	const startMoment = e.startDateTime.set('hour', sh).set('minutes', sm);
	const endMoment = e.startDateTime.set('hour', eh).set('minutes', em);
	return e.startDateTime.isBetween(startMoment, endMoment, 'minute', '[]');
}

// ─── Window for multiday split filtering ──────────────────────────────────────

function computeVisibilityWindow(config: atomicCardConfig, mode: Mode, entityMaxDays: number | undefined): DateRange {
	if (mode === 'Planner') {
		const { start, end } = getPlannerDateRange(config);
		if (entityMaxDays !== undefined) {
			const daysToShow = entityMaxDays === 0 ? 0 : entityMaxDays - 1;
			return { start, end: start.add(daysToShow, 'day').endOf('day') };
		}
		return { start, end };
	}

	const start = dayjs().startOf('day').add(config.startDaysAhead!, 'day');
	const max = entityMaxDays !== undefined ? entityMaxDays : config.maxDaysToShow!;
	const end = start.endOf('day').add(max === 0 ? max : max - 1, 'day');
	return { start, end };
}

function partialIsInWindow(partial: EventClass, window: DateRange): boolean {
	return (
		window.end.isAfter(partial.startDateTime) && window.start.subtract(1, 'minute').isBefore(partial.startDateTime)
	);
}

// ─── Multiday handling ────────────────────────────────────────────────────────

function expandMultiDay(event: EventClass, config: atomicCardConfig, mode: Mode): EventClass[] {
	if (!config.showMultiDay || !event.isMultiDay) {
		return [event];
	}
	const partials = event.split();
	if (mode === 'Calendar') return partials;
	const window = computeVisibilityWindow(config, mode, event.entityConfig.maxDaysToShow);
	return partials.filter((p) => partialIsInWindow(p, window));
}

// ─── Dedup / sort / trim ──────────────────────────────────────────────────────

function applyHideDuplicates(events: EventClass[]): EventClass[] {
	const seen: Record<string, { event: EventClass; calendars: string[] }> = {};
	const kept: EventClass[] = [];

	for (const event of events) {
		const key = `${event.title}|${event.startDateTime}|${event.endDateTime}`;
		if (!seen[key]) {
			seen[key] = { event, calendars: [event.originName] };
			kept.push(event);
		} else {
			seen[key].calendars.push(event.originName);
		}
	}

	for (const event of kept) {
		const key = `${event.title}|${event.startDateTime}|${event.endDateTime}`;
		const entry = seen[key];
		if (entry) {
			event.originName = entry.calendars.join(', ');
		}
	}

	return kept;
}

function applyEventCountLimit(
	events: EventClass[],
	maxEventCount: number | undefined,
	softLimit: number | undefined,
): { events: EventClass[]; hidden: number } {
	if (!maxEventCount) return { events, hidden: 0 };
	const overHardLimit = !softLimit && maxEventCount < events.length;
	const overSoftLimit = !!softLimit && events.length > maxEventCount + softLimit;
	if (!overHardLimit && !overSoftLimit) return { events, hidden: 0 };
	const hidden = events.length - maxEventCount;
	return { events: events.slice(0, maxEventCount), hidden };
}

// ─── Core processing ──────────────────────────────────────────────────────────

export function processEvents(rawEvents: any[], config: atomicCardConfig, mode: Mode): [EventClass[], number] {
	let events: EventClass[] = [];

	for (const raw of rawEvents) {
		raw.originCalendar = config.entities.find((entity: { entity: string }) => entity.entity === raw.entity.entity);
		const event = new EventClass(raw, config);

		if (!passesAllDayBeforeWindow(event, config, mode)) continue;
		if (!passesDeclined(event, config)) continue;
		if (!passesAllDayHidden(event, config)) continue;
		if (!passesBlocklist(event)) continue;
		if (!passesBlocklistLocation(event)) continue;
		if (!passesAllowlist(event)) continue;
		if (!passesAllowlistLocation(event)) continue;
		if (!passesMaxDaysWindow(event, config, mode)) continue;
		if (!passesTimeOfDayWindow(event)) continue;

		events.push(...expandMultiDay(event, config, mode));
	}

	if (config.hideFinishedEvents) {
		events = events.filter((e) => !e.isFinished);
	}

	if (config.hideDuplicates) {
		events = applyHideDuplicates(events);
	}

	events = sortEvents(events, config);

	const { events: trimmed, hidden } = applyEventCountLimit(events, config.maxEventCount, config.softLimit);
	return [trimmed, hidden];
}

// ─── Range helpers ────────────────────────────────────────────────────────────

export function getPlannerDateRange(config: atomicCardConfig): DateRange {
	const daysToShow = config.plannerDaysToShow! === 0 ? config.plannerDaysToShow! : config.plannerDaysToShow! - 1;
	const today = dayjs();
	let start = today.startOf('day').add(config.startDaysAhead!, 'day');

	if (!config.plannerRollingWeek) {
		const currentDay = start.day();
		const firstDay = config.firstDayOfWeek!;
		let diff = currentDay - firstDay;
		if (diff < 0) diff += 7;
		start = start.subtract(diff, 'day').startOf('day');
	}

	const end = start.endOf('day').add(daysToShow, 'day');
	return { start, end };
}

function getEventModeRange(config: atomicCardConfig): DateRange {
	const daysToShow = config.maxDaysToShow! === 0 ? config.maxDaysToShow! : config.maxDaysToShow! - 1;
	const today = dayjs();
	const start = today.startOf('day').add(config.startDaysAhead!, 'day');
	const end = start.endOf('day').add(daysToShow, 'day');
	return { start, end };
}

// ─── Network seam ─────────────────────────────────────────────────────────────

export async function fetchRawEvents(
	hass: any,
	config: atomicCardConfig,
	range: DateRange,
	mode: Mode,
): Promise<{ raw: any[]; failed: FailedEvent[] }> {
	const dateFormat = 'YYYY-MM-DDTHH:mm:ss';
	const startTime = range.start.startOf('day').format(dateFormat);
	const raw: any[] = [];
	const failed: FailedEvent[] = [];

	const promises = config.entities.map((entity: any) => {
		const entityObj = typeof entity === 'string' ? { entity } : entity;
		const calendarEntity = entityObj.entity;
		const daysToShow = entityObj.maxDaysToShow === 0 ? 0 : entityObj.maxDaysToShow - 1;
		const endTime =
			mode === 'Calendar' || entityObj.maxDaysToShow === undefined
				? range.end.endOf('day').format(dateFormat)
				: range.start.endOf('day').add(daysToShow, 'day').format(dateFormat);
		const url = `calendars/${calendarEntity}?start=${startTime}&end=${endTime}`;

		return hass
			.callApi('GET', url)
			.then((events: any[]) => {
				for (const event of events) {
					event.entity = entityObj;
					event.calendarEntity = calendarEntity;
					event.hassEntity = hass.states[calendarEntity];
				}
				raw.push(...events);
			})
			.catch((error: unknown) => {
				failed.push({ name: entityObj.name || calendarEntity, error });
			});
	});

	await Promise.all(promises);
	return { raw, failed };
}

// ─── Public API for views ─────────────────────────────────────────────────────

export async function fetchEventModeEvents(config: atomicCardConfig, hass: any): Promise<PipelineResult> {
	const range = getEventModeRange(config);
	const { raw, failed } = await fetchRawEvents(hass, config, range, 'Event');
	const [events, hidden] = processEvents(raw, config, 'Event');
	return { events, hidden, failed };
}

export async function fetchPlannerEvents(config: atomicCardConfig, hass: any): Promise<PipelineResult> {
	const range = getPlannerDateRange(config);
	const { raw, failed } = await fetchRawEvents(hass, config, range, 'Planner');
	const [events, hidden] = processEvents(raw, config, 'Planner');
	return { events, hidden, failed };
}

// Group events into per-day buckets keyed by daysToSort.
export function groupEventsByDay(events: EventClass[]): EventClass[][] {
	const buckets: Record<string, EventClass[]> = {};
	for (const event of events) {
		const key = (event as unknown as { daysToSort: number }).daysToSort.toString();
		if (!buckets[key]) buckets[key] = [];
		buckets[key].push(event);
	}
	return Object.keys(buckets).map((k) => buckets[k]);
}
