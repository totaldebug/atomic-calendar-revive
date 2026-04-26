import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import dayjs from 'dayjs';
import { TemplateResult, html } from 'lit';

import { atomicCardConfig } from '../../types/config';
import { HomeAssistant } from '../../types/homeassistant';
import { ICardHost } from '../card-host.interface';
import { showCalendarLink } from '../common.html';
import EventClass from '../event.class';
import { fetchRawEvents, processEvents } from '../pipeline';

export interface CalendarDay {
	date: dayjs.Dayjs;
	allEvents: EventClass[];
}

export interface CellContext {
	isToday: boolean;
	weekendClass: string;
	differentMonthClass: string;
	weekNumber: TemplateResult;
}

export interface GridSlot {
	renderCellBody(day: CalendarDay, ctx: CellContext): TemplateResult;
	onCellClick?(day: CalendarDay): void;
	cellHighlightStyle?(day: CalendarDay): string;
	cellInnerClass?: string;
	renderAfter?(): TemplateResult;
	onMonthLoaded?(month: CalendarDay[]): void;
}

function buildEmptyMonth(config: atomicCardConfig, selectedMonth: dayjs.Dayjs): CalendarDay[] {
	const firstDay = selectedMonth.startOf('month');
	const dayOfWeekNumber = firstDay.day();
	const month: CalendarDay[] = [];
	const weekShift = dayOfWeekNumber - config.firstDayOfWeek! >= 0 ? 0 : 7;
	for (
		let i = config.firstDayOfWeek! - dayOfWeekNumber - weekShift;
		i < 42 - dayOfWeekNumber + config.firstDayOfWeek! - weekShift;
		i++
	) {
		month.push({ date: firstDay.add(i, 'day'), allEvents: [] });
	}
	return month;
}

export class MonthGrid {
	private selectedMonth: dayjs.Dayjs = dayjs();
	private month: CalendarDay[] = [];
	private lastUpdate: dayjs.Dayjs | null = null;
	private refreshNeeded = true;
	private isUpdating = false;
	private hass!: HomeAssistant;
	private config!: atomicCardConfig;

	constructor(private host: ICardHost) {}

	get currentMonth(): dayjs.Dayjs {
		return this.selectedMonth;
	}

	get hasEvents(): boolean {
		return this.month.some((day) => day.allEvents.length > 0);
	}

	async update(hass: HomeAssistant, config: atomicCardConfig): Promise<void> {
		this.hass = hass;
		this.config = config;

		const stale = !this.lastUpdate || dayjs().diff(this.lastUpdate, 'second') > this.config.refreshInterval;
		if (this.isUpdating || (!this.refreshNeeded && !stale)) return;

		this.isUpdating = true;
		this.lastUpdate = dayjs();
		this.host.setLoading(true);
		this.host.scheduleRender();

		try {
			const month = buildEmptyMonth(config, this.selectedMonth);
			const { raw } = await fetchRawEvents(hass, config, { start: month[0].date, end: month[41].date });
			const [events] = processEvents(raw, config, 'Calendar');
			for (const day of month) {
				for (const event of events) {
					if (event.startDateTime.isSame(day.date, 'day')) {
						day.allEvents.push(event);
					}
				}
			}
			this.month = month;
			this.refreshNeeded = false;
		} finally {
			this.isUpdating = false;
			this.host.setLoading(false);
			this.host.scheduleRender();
		}
	}

	changeMonth(delta: number): void {
		this.selectedMonth = this.selectedMonth.add(delta, 'month');
		this.refreshNeeded = true;
		this.host.scheduleRender();
	}

	render(slot: GridSlot): TemplateResult {
		if (slot.onMonthLoaded && this.month.length === 42) {
			slot.onMonthLoaded(this.month);
		}

		const firstDayOfWeek = this.config.firstDayOfWeek ?? 1;
		const days = dayjs.weekdaysMin(false);
		const weekDays = [...days.slice(firstDayOfWeek), ...days.slice(0, firstDayOfWeek)];
		const dayHeaders = weekDays.map(
			(day) => html`<th class="cal" style="color: ${this.config.calWeekDayColor};">${day}</th>`,
		);

		return html`
			<div class="calTitleContainer">${this.renderHeader()}${showCalendarLink(this.config, this.selectedMonth)}</div>
			<div class="calTableContainer">
				<table class="cal" style="color: ${this.config.eventTitleColor};--cal-border-color:${this.config.calGridColor}">
					<thead>
						<tr>
							${dayHeaders}
						</tr>
					</thead>
					<tbody>
						${this.renderRows(slot)}
					</tbody>
				</table>
			</div>
			${slot.renderAfter ? slot.renderAfter() : ''}
		`;
	}

	private renderHeader(): TemplateResult {
		const dateColor = this.config.calDateColor;
		const colorVar = dateColor ? `--cal-date-color: ${dateColor}` : '';
		return html`<div class="calDateSelector" style=${colorVar}>
			<ha-icon-button
				class="prev"
				.path=${mdiChevronLeft}
				.label=${this.hass.localize('ui.common.previous')}
				@click="${() => this.changeMonth(-1)}"
			></ha-icon-button>
			<span class="date">${this.selectedMonth.format('MMMM')} ${this.selectedMonth.format('YYYY')}</span>
			<ha-icon-button
				class="next"
				.path=${mdiChevronRight}
				.label=${this.hass.localize('ui.common.next')}
				@click="${() => this.changeMonth(1)}"
			></ha-icon-button>
		</div>`;
	}

	private renderRows(slot: GridSlot): TemplateResult[] {
		if (this.month.length < 42) return [];

		const showLastRow =
			this.config.showLastCalendarWeek || dayjs(this.month[35].date).isSame(this.selectedMonth, 'month');

		const rows: TemplateResult[] = [];
		let batch: TemplateResult[] = [];

		this.month.forEach((day, i) => {
			if (i >= 35 && !showLastRow) return;
			batch.push(this.renderCell(day, i, slot));
			if (i % 7 === 6) {
				rows.push(
					html`<tr class="cal">
						${batch}
					</tr>`,
				);
				batch = [];
			}
		});

		if (batch.length > 0) {
			rows.push(
				html`<tr class="cal">
					${batch}
				</tr>`,
			);
		}
		return rows;
	}

	private renderCell(day: CalendarDay, i: number, slot: GridSlot): TemplateResult {
		const dayDate = dayjs(day.date);
		const isToday = dayDate.isSame(dayjs(), 'day');
		const differentMonthClass = dayDate.isSame(this.selectedMonth, 'month') ? '' : 'differentMonth';
		const weekendClass = dayDate.isoWeekday() === 6 ? 'weekendSat' : dayDate.isoWeekday() === 7 ? 'weekendSun' : '';
		const todayClass = isToday ? 'currentDay' : '';
		const showWeek = !!this.config.showWeekNumber && i % 7 === 0;
		const weekNumber = showWeek
			? html`<div
					class="cal-week-number"
					style="position: absolute; top: 0px; left: 0px; background-color: #757575; color: #ffffff; font-size: 0.75em; padding: 2px 5px; font-weight: bold;"
				>
					W${dayDate.week()}
				</div>`
			: html``;

		const highlightStyle = slot.cellHighlightStyle?.(day) ?? '';
		const innerClass = slot.cellInnerClass ? ` ${slot.cellInnerClass}` : '';
		const clickHandler = slot.onCellClick ? () => slot.onCellClick!(day) : undefined;

		return html`
			<td
				@click=${clickHandler}
				class="cal day ${weekendClass} ${differentMonthClass}"
				style="${highlightStyle} --cal-grid-color: ${this.config.calGridColor}; --cal-day-color: ${this.config
					.calDayColor}"
			>
				<div class="calDay${innerClass}" style="${highlightStyle}">
					${weekNumber}
					<div class="day-number ${todayClass}">${day.date.date()}</div>
					${slot.renderCellBody(day, { isToday, weekendClass, differentMonthClass, weekNumber })}
				</div>
			</td>
		`;
	}
}
