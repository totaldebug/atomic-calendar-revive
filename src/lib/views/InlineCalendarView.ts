import { TemplateResult, html } from 'lit';

import { CalendarDay, MonthGrid } from './month-grid';
import { getEntityIcon } from '../../helpers/get-icon';
import { atomicCardConfig } from '../../types/config';
import { HomeAssistant } from '../../types/homeassistant';
import { ICardHost } from '../card-host.interface';
import EventClass from '../event.class';
import { ICalendarView } from '../view.interface';

export interface InlineEventStyle {
	/** CSS `background-color` value, or `''` for no fill (timed events). */
	background: string;
	/** CSS `color` value for the bar text and icon. */
	textColor: string;
}

// #1794: all-day events render as a filled bar. Both the fill and the text used
// to default to the same token (`defaultCalColor` and `eventTitleColor` both
// resolve to `var(--primary-text-color)`), so with no per-calendar `color:` the
// bar's fill equalled its own text and the event was invisible. Default the fill
// to the theme accent instead and pair it with `--text-primary-color` (the token
// intended to contrast solid fills) so the title stays legible; a per-calendar
// `color:` still overrides the fill. Timed events keep coloured text and no fill.
export function resolveInlineEventStyle(event: EventClass, config: atomicCardConfig): InlineEventStyle {
	const customColor = event.entityConfig.color;
	const hasCustomColor = typeof customColor !== 'undefined';
	if (event.isAllDayEvent) {
		return {
			background: hasCustomColor ? customColor : 'var(--primary-color)',
			textColor: 'var(--text-primary-color)',
		};
	}
	return { background: '', textColor: hasCustomColor ? customColor : config.defaultCalColor };
}

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
			const isAllDay = event.isAllDayEvent;
			const { background, textColor: titleColor } = resolveInlineEventStyle(event, this.config);
			const backgroundStyle = background ? `background-color: ${background};` : '';
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
