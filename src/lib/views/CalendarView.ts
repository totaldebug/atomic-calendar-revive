import dayjs from 'dayjs';
import { TemplateResult, html } from 'lit';

import { getEntityIcon } from '../../helpers/get-icon';
import { atomicCardConfig } from '../../types/config';
import { HomeAssistant } from '../../types/homeassistant';
import { ICardHost } from '../card-host.interface';
import { getCalendarDescriptionHTML, getCalendarLocationHTML, getTitleHTML } from '../common.html';
import EventClass from '../event.class';
import { ICalendarView } from '../view.interface';
import { CalendarDay, MonthGrid } from './month-grid';

export class CalendarView implements ICalendarView {
	private grid: MonthGrid;
	private clickedDate: dayjs.Dayjs | null = null;
	private summaryHtml: TemplateResult | TemplateResult[] = html`&nbsp;`;
	private config!: atomicCardConfig;
	private hass!: HomeAssistant;

	constructor(private parent: ICardHost) {
		this.grid = new MonthGrid(parent);
	}

	get hasEvents(): boolean {
		return this.grid.hasEvents;
	}

	async update(hass: HomeAssistant, config: atomicCardConfig): Promise<void> {
		this.hass = hass;
		this.config = config;
		await this.grid.update(hass, config);
	}

	render(): TemplateResult {
		return this.grid.render({
			renderCellBody: (day) => html`
				<div class="iconDiv" style="padding-top: 22px; padding-bottom: 5px;">${this.renderDayIcons(day)}</div>
			`,
			onCellClick: (day) => this.selectDay(day),
			cellHighlightStyle: (day) =>
				dayjs(day.date).isSame(dayjs(this.clickedDate), 'day')
					? `background-color: ${this.config.calActiveEventBackgroundColor};`
					: '',
			renderAfter: () => html`<div class="summary-div">${this.summaryHtml}</div>`,
			onMonthLoaded: (month) => {
				if (this.clickedDate) return;
				const today = month.find((d) => dayjs(d.date).isSame(dayjs(), 'day'));
				if (today) this.summaryHtml = this.buildSummary(today);
			},
		});
	}

	private selectDay(day: CalendarDay): void {
		this.clickedDate = day.date;
		this.summaryHtml = this.buildSummary(day);
		this.parent.scheduleRender();
	}

	private buildSummary(day: CalendarDay): TemplateResult[] {
		return day.allEvents.map((event) => {
			const eventColor =
				typeof event.entityConfig.color !== 'undefined' ? event.entityConfig.color : this.config.defaultCalColor;
			const finishedEventsStyle =
				event.isFinished && this.config.dimFinishedEvents
					? `opacity: ${this.config.finishedEventOpacity}; filter: ${this.config.finishedEventFilter};`
					: '';

			if (event.isAllDayEvent) {
				const bulletType = event.isDeclined ? 'summary-fullday-div-declined' : 'summary-fullday-div-accepted';
				return html`<div class="${bulletType}" style="border-color: ${eventColor}; ${finishedEventsStyle}">
					<div class="event-summary-content" aria-hidden="true">
						${getTitleHTML(this.config, event, this.hass, 'Calendar')} ${getCalendarLocationHTML(this.config, event)}
						${this.config.calShowDescription ? getCalendarDescriptionHTML(this.config, event) : ''}
					</div>
				</div>`;
			}

			const eventTime = this.config.showHours
				? html`<div class="hours">
						${event.startDateTime.format('LT')}${this.config.showEndTime ? `-${event.endDateTime.format('LT')}` : ''}
					</div>`
				: '';
			const bulletType = event.isDeclined ? 'bullet-event-div-declined' : 'bullet-event-div-accepted';
			return html`
				<div class="summary-event-div" style="color: ${eventColor}; ${finishedEventsStyle}">
					<div class="${bulletType}" style="border-color: ${eventColor}"></div>
					${eventTime} - ${getTitleHTML(this.config, event, this.hass, 'Calendar')}
					${getCalendarLocationHTML(this.config, event)}
					${this.config.calShowDescription ? getCalendarDescriptionHTML(this.config, event) : ''}
				</div>
			`;
		});
	}

	private renderDayIcons(day: CalendarDay): TemplateResult[] {
		const myIcons: { icon: string; color: string }[] = [];
		day.allEvents.forEach((event: EventClass) => {
			let { icon } = event.entityConfig;
			if (!icon || icon.length === 0) {
				icon = getEntityIcon(event.entity.entity_id, this.hass);
			}
			const exists = myIcons.findIndex((x) => x.icon === icon && x.color === event.entityConfig.color);
			if (exists === -1) {
				myIcons.push({ icon, color: event.entityConfig.color });
			}
		});
		myIcons.sort((a, b) => a.icon.localeCompare(b.icon));
		return myIcons.map(
			(icon) =>
				html`<span>
					<ha-icon icon="${icon.icon}" class="calIcon" style="color: ${icon.color};"></ha-icon>
				</span>`,
		);
	}
}
