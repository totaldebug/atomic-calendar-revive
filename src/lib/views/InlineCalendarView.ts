import { TemplateResult, html } from 'lit';

import { CalendarDay, MonthGrid } from './month-grid';
import { getEntityIcon } from '../../helpers/get-icon';
import { atomicCardConfig } from '../../types/config';
import { HomeAssistant } from '../../types/homeassistant';
import { ICardHost } from '../card-host.interface';
import { ICalendarView } from '../view.interface';

export class InlineCalendarView implements ICalendarView {
	private grid: MonthGrid;
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
			cellInnerClass: 'inline',
			renderCellBody: (day) => html`
				<div class="events" style="padding-top: 22px; padding-bottom: 5px;">${this.renderEvents(day)}</div>
			`,
		});
	}

	private renderEvents(day: CalendarDay): TemplateResult[] {
		return day.allEvents.map((event) => {
			const eventColor =
				typeof event.entityConfig.color !== 'undefined' ? event.entityConfig.color : this.config.defaultCalColor;
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
				: html``;

			return html`
				<div
					class="event-bar ${isAllDay ? 'all-day' : ''}"
					style="${backgroundStyle} color: ${titleColor};"
					@click="${(e: Event) => {
						e.stopPropagation();
						this.parent.openEventDetail(event);
						this.parent.scheduleRender();
					}}"
				>
					${iconHtml} ${!isAllDay ? html`<span class="time">${time}</span>` : ''}
					<span class="title">${event.title}</span>
				</div>
			`;
		});
	}
}
