import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import dayjs from 'dayjs';
import { TemplateResult, html } from 'lit';

import { getEntityIcon } from '../../helpers/get-icon';
import { atomicCardConfig } from '../../types/config';
import { HomeAssistant } from '../../types/homeassistant';
import CalendarDay from '../calendar.class';
import { showCalendarLink } from '../common.html';
import EventClass from '../event.class';
import { getCalendarMode } from '../event.func';
import { ILoaderHost } from '../loader-host.interface';
import { ICalendarView } from '../view.interface';

export class InlineCalendarView implements ICalendarView {
	private selectedMonth: dayjs.Dayjs;
	private monthToGet: string;
	private refreshCalEvents: boolean = true;
	private lastCalendarUpdateTime: dayjs.Dayjs | null = null;
	private showLoader: boolean = false;
	private hiddenEvents: number = 0;
	private month: any[] = [];
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
		return true;
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
		const weekDays = dayjs.weekdaysMin(true);
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
		`;
	}

	private handleMonthChange(i: number) {
		this.selectedMonth = this.selectedMonth.add(i, 'month');
		this.monthToGet = this.selectedMonth.format('M');
		this.refreshCalEvents = true;
		this.parent.requestUpdate();
	}

	private getCalendarHeaderHTML() {
		return html`<div class="calDateSelector">
			<ha-icon-button
				class="prev"
				style="--mdc-icon-color: ${this.config.calDateColor}"
				.path=${mdiChevronLeft}
				.label=${this.hass.localize('ui.common.previous')}
				@click="${() => this.handleMonthChange(-1)}"
			>
			</ha-icon-button>
			<span class="date" style="text-decoration: none; color: ${this.config.calDateColor};">
				${this.selectedMonth.format('MMMM')} ${this.selectedMonth.format('YYYY')}
			</span>
			<ha-icon-button
				class="next"
				style="--mdc-icon-color: ${this.config.calDateColor}"
				.path=${mdiChevronRight}
				.label=${this.hass.localize('ui.common.next')}
				@click="${() => this.handleMonthChange(1)}"
			>
			</ha-icon-button>
		</div>`;
	}

	private getCalendarDaysHTML(month: any[]) {
		if (!month || month.length < 35) {
			return html``;
		}

		let showLastRow = true;
		if (!this.config.showLastCalendarWeek && !dayjs(month[35].date).isSame(this.selectedMonth, 'month')) {
			showLastRow = false;
		}

		return month.map((day: CalendarDay, i: number) => {
			const dayDate = dayjs(day.date);
			const dayStyleOtherMonth = dayDate.isSame(this.selectedMonth, 'month') ? '' : `differentMonth`;
			const dayClassToday = dayDate.isSame(dayjs(), 'day') ? `currentDay` : ``;
			const dayStyleSat = dayDate.isoWeekday() == 6 ? `weekendSat` : ``;
			const dayStyleSun = dayDate.isoWeekday() == 7 ? `weekendSun` : ``;

			if (i < 35 || showLastRow) {
				return html`
					${i % 7 === 0 ? html`<tr class="cal"></tr>` : ''}
					<td
						class="cal ${dayStyleSat} ${dayStyleSun} ${dayStyleOtherMonth}"
						style="--cal-grid-color: ${this.config.calGridColor}; --cal-day-color: ${this.config.calDayColor}"
					>
						<div class="calDay inline">
							<div class="${dayClassToday}" style="position: relative; top: 5%;">${day.date.date()}</div>
							<div class="events">
								${day.allEvents.map((event: EventClass) => {
									const eventColor =
										typeof event.entityConfig.color != 'undefined'
											? event.entityConfig.color
											: this.config.defaultCalColor;
									const isAllDay = event.isAllDayEvent;
									const titleColor = isAllDay ? this.config.eventTitleColor : eventColor;
									const backgroundStyle = isAllDay ? `background-color: ${eventColor};` : '';

									const time = !isAllDay
										? `${event.startDateTime.format('LT')}${this.config.showEndTime ? ` - ${event.endDateTime.format('LT')}` : ''}`
										: '';

									const icon =
										event.entityConfig.icon && event.entityConfig.icon !== 'undefined'
											? event.entityConfig.icon
											: getEntityIcon(event.entity.entity_id || event.entityConfig.entity, this.hass);

									const iconHtml = icon
										? html`<ha-icon class="event-icon" style="color: ${titleColor};" icon="${icon}"></ha-icon>`
										: '';

									return html`
										<div
											class="event-bar ${isAllDay ? 'all-day' : ''}"
											style="${backgroundStyle} color: ${titleColor};"
											@click="${(e: Event) => {
												e.stopPropagation();
												this.parent.selectedEvent = event;
												this.parent.requestUpdate();
											}}"
										>
											${iconHtml} ${!isAllDay ? html`<span class="time">${time}</span>` : ''}
											<span class="title">${event.title}</span>
										</div>
									`;
								})}
							</div>
						</div>
					</td>
					${i && i % 6 === 0 ? html`</tr>` : ''}
				`;
			} else {
				return html``;
			}
		});
	}
}
