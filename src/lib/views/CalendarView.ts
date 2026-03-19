import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import dayjs from 'dayjs';
import { TemplateResult, html } from 'lit';

import { getEntityIcon } from '../../helpers/get-icon';
import { atomicCardConfig } from '../../types/config';
import { HomeAssistant } from '../../types/homeassistant';
import CalendarDay from '../calendar.class';
import { getCalendarDescriptionHTML, getCalendarLocationHTML, getTitleHTML, showCalendarLink } from '../common.html';
import EventClass from '../event.class';
import { getCalendarMode } from '../event.func';
import { ILoaderHost } from '../loader-host.interface';
import { ICalendarView } from '../view.interface';

export class CalendarView implements ICalendarView {
	private selectedMonth: dayjs.Dayjs;
	private monthToGet: string;
	private refreshCalEvents: boolean = true;
	private lastCalendarUpdateTime: dayjs.Dayjs | null = null;
	private showLoader: boolean = false;
	private hiddenEvents: number = 0;
	private month: any[] = [];
	private eventSummary: TemplateResult | void | TemplateResult<1>[] = html`&nbsp;`;
	private clickedDate: dayjs.Dayjs | null = null;
	private config!: atomicCardConfig;
	private hass!: HomeAssistant;
	private parent: ILoaderHost;

	constructor(parent: ILoaderHost) {
		this.parent = parent;
		this.selectedMonth = dayjs();
		this.monthToGet = dayjs().format('MM');
	}

	get hasEvents(): boolean {
		return this.month.some((day) => day.allEvents.length > 0);
	}

	async update(hass: HomeAssistant, config: atomicCardConfig): Promise<void> {
		this.hass = hass;
		this.config = config;

		if (
			this.refreshCalEvents ||
			!this.lastCalendarUpdateTime ||
			dayjs().diff(dayjs(this.lastCalendarUpdateTime), 'second') > this.config.refreshInterval
		) {
			this.lastCalendarUpdateTime = dayjs();
			this.showLoader = true;
			this.parent.showLoader = true;
			this.parent.requestUpdate(); // Trigger loader
			// get the calendar and all its events
			this.month = await getCalendarMode(this.config, this.hass, this.selectedMonth);
			this.refreshCalEvents = false;
			this.showLoader = false;
			this.parent.showLoader = false;
			this.hiddenEvents = 0;
			this.parent.requestUpdate();
		}
	}

	render(): TemplateResult {
		const firstDay = this.config.firstDayOfWeek ?? 1;
		const days = dayjs.weekdaysMin(false);
		const weekDays = [...days.slice(firstDay), ...days.slice(0, firstDay)];
		const htmlDayNames = weekDays.map(
			(day) => html`<th class="cal" style="color:  ${this.config.calWeekDayColor};">${day}</th>`,
		);
		return html`
			<div class="calTitleContainer">
				${this.getCalendarHeaderHTML()}${showCalendarLink(this.config, this.selectedMonth)}
			</div>
			<div class="calTableContainer">
				<table class="cal" style="color: ${this.config.eventTitleColor};--cal-border-color:${this.config.calGridColor}">
					<thead>
						<tr>
							${htmlDayNames}
						</tr>
					</thead>
					<tbody>
						${this.getCalendarDaysHTML(this.month)}
					</tbody>
				</table>
			</div>
			<div class="summary-div">${this.eventSummary}</div>
		`;
	}

	private handleMonthChange(i: number) {
		this.selectedMonth = this.selectedMonth.add(i, 'month');
		this.monthToGet = this.selectedMonth.format('M');
		this.eventSummary = html`&nbsp;`;
		this.refreshCalEvents = true;
		this.parent.requestUpdate();
	}

	private getCalendarHeaderHTML() {
		return html`<div class="calDateSelector">
			<ha-icon-button
				class="prev"
				.path=${mdiChevronLeft}
				.label=${this.hass.localize('ui.common.previous')}
				@click="${() => this.handleMonthChange(-1)}"
			>
			</ha-icon-button>
			<span class="date"> ${this.selectedMonth.format('MMMM')} ${this.selectedMonth.format('YYYY')} </span>
			<ha-icon-button
				class="next"
				.path=${mdiChevronRight}
				.label=${this.hass.localize('ui.common.next')}
				@click="${() => this.handleMonthChange(1)}"
			>
			</ha-icon-button>
		</div>`;
	}

	private getCalendarDaysHTML(month: any[]) {
		let showLastRow = true;
		if (!this.config.showLastCalendarWeek && !dayjs(month[35].date).isSame(this.selectedMonth, 'month')) {
			showLastRow = false;
		}

		const rows: TemplateResult[] = [];
		let currentBatch: TemplateResult[] = [];

		month.forEach((day: CalendarDay, i: number) => {
			if (i >= 35 && !showLastRow) {
				return;
			}

			const dayDate = dayjs(day.date);
			const dayStyleOtherMonth = dayDate.isSame(this.selectedMonth, 'month') ? '' : `differentMonth`;
			const dayClassToday = dayDate.isSame(dayjs(), 'day') ? `currentDay` : ``;
			const dayStyleSat = dayDate.isoWeekday() == 6 ? `weekendSat` : ``;
			const dayStyleSun = dayDate.isoWeekday() == 7 ? `weekendSun` : ``;
			const dayStyleClicked = dayDate.isSame(dayjs(this.clickedDate), 'day')
				? `background-color: ${this.config.calActiveEventBackgroundColor};`
				: ``;

			if (dayDate.isSame(dayjs(), 'day') && !this.clickedDate) {
				this.handleCalendarEventSummary(day, false);
			}

			const showWeek = this.config.showWeekNumber && i % 7 === 0;
			const weekHtml = showWeek
				? html`<div
						class="cal-week-number"
						style="position: absolute; top: 0px; left: 0px; background-color: #757575; color: #ffffff; font-size: 0.75em; padding: 2px 5px; font-weight: bold;"
					>
						W${dayDate.week()}
					</div>`
				: '';

			currentBatch.push(html`
				<td
					@click="${() => this.handleCalendarEventSummary(day, true)}"
					class="cal day ${dayStyleSat} ${dayStyleSun} ${dayStyleOtherMonth}"
					style="${dayStyleClicked} --cal-grid-color: ${this.config.calGridColor}; --cal-day-color: ${this.config
						.calDayColor}"
				>
					<div class="calDay" style="${dayStyleClicked}">
						${weekHtml}
						<div class="day-number ${dayClassToday}">${day.date.date()}</div>
						<div class="iconDiv" style="padding-top: 22px; padding-bottom: 5px;">${this.handleCalendarIcons(day)}</div>
					</div>
				</td>
			`);

			if (i % 7 === 6) {
				rows.push(
					html`<tr class="cal">
						${currentBatch}
					</tr>`,
				);
				currentBatch = [];
			}
		});

		if (currentBatch.length > 0) {
			rows.push(
				html`<tr class="cal">
					${currentBatch}
				</tr>`,
			);
		}

		return rows;
	}

	private handleCalendarEventSummary(day: CalendarDay, fromClick: boolean) {
		if (fromClick) {
			this.clickedDate = day.date;
		}
		const dayEvents = day.allEvents;

		this.eventSummary = dayEvents.map((event: EventClass) => {
			const eventColor =
				typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this.config.defaultCalColor;
			const finishedEventsStyle =
				event.isFinished && this.config.dimFinishedEvents
					? `opacity: ` + this.config.finishedEventOpacity + `; filter: ` + this.config.finishedEventFilter + `;`
					: ``;

			// is it a full day event? if so then use border instead of bullet else, use a bullet
			if (event.isAllDayEvent) {
				const bulletType: string = event.isDeclined ? 'summary-fullday-div-declined' : 'summary-fullday-div-accepted';

				return html`<div class="${bulletType}" style="border-color:  ${eventColor}; ${finishedEventsStyle}">
					<div class="event-summary-content" aria-hidden="true">
						${getTitleHTML(this.config, event, this.hass, 'Calendar')} ${getCalendarLocationHTML(this.config, event)}
						${this.config.calShowDescription ? getCalendarDescriptionHTML(this.config, event) : ''}
					</div>
				</div>`;
			} else {
				const eventTime = this.config.showHours
					? html`<div class="hours">
							${event.startDateTime.format('LT')}${this.config.showEndTime ? `-${event.endDateTime.format('LT')}` : ''}
						</div>`
					: '';

				const bulletType: string = event.isDeclined ? 'bullet-event-div-declined' : 'bullet-event-div-accepted';

				return html`
					<div class="summary-event-div" style="color: ${eventColor}; ${finishedEventsStyle}">
						<div class="${bulletType}" style="border-color: ${eventColor}"></div>
						${eventTime} - ${getTitleHTML(this.config, event, this.hass, 'Calendar')}
						${getCalendarLocationHTML(this.config, event)}
						${this.config.calShowDescription ? getCalendarDescriptionHTML(this.config, event) : ''}
					</div>
				`;
			}
		});
		this.parent.requestUpdate();
	}

	private handleCalendarIcons(day: CalendarDay) {
		const allIcons: any[] = [];
		const myIcons: any[] = [];
		day.allEvents.map((event: EventClass) => {
			let { icon } = event.entityConfig;
			if (!icon || icon.length === 0) {
				// If icon is not set or is an empty string, use getEntityIcon as a fallback
				icon = getEntityIcon(event.entity.entity_id, this.hass);
			}

			const index = myIcons.findIndex((x) => x.icon === icon && x.color === event.entityConfig.color);
			if (index === -1) {
				myIcons.push({ icon, color: event.entityConfig.color });
			}
		});
		// Sort myIcons alphabetically by icon property
		myIcons.sort((a, b) => a.icon.localeCompare(b.icon));

		myIcons.map((icon) => {
			const dayIcon = html`<span>
				<ha-icon icon="${icon.icon}" class="calIcon" style="color: ${icon.color};"></ha-icon>
			</span>`;

			allIcons.push(dayIcon);
		});

		return allIcons;
	}
}
