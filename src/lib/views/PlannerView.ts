import dayjs from 'dayjs';
import { TemplateResult, html } from 'lit';

import localize from '../../localize/localize';
import { atomicCardConfig } from '../../types/config';
import { HomeAssistant } from '../../types/homeassistant';
import { getTitleHTML, setNoEventDays } from '../common.html';
import EventClass from '../event.class';
import { getPlannerDateRange, getPlannerMode, groupEventsByDay } from '../event.func';
import { ILoaderHost } from '../loader-host.interface';
import { ICalendarView } from '../view.interface';

/**
 * PlannerView displays a grid of events for multiple calendars.
 * Recommendation: Use this view in a Panel (1-column) view for optimal horizontal space.
 */
export class PlannerView implements ICalendarView {
	private events: any[] = [];
	private hiddenEvents: number = 0;
	private failedEvents: any[] = [];
	private lastEventsUpdateTime: dayjs.Dayjs | null = null;
	private errorMessage: TemplateResult = html``;
	private isUpdating: boolean = false;
	private config!: atomicCardConfig;
	private hass!: HomeAssistant;
	private parent: ILoaderHost;

	constructor(parent: ILoaderHost) {
		this.parent = parent;
	}

	async update(hass: HomeAssistant, config: atomicCardConfig): Promise<void> {
		this.config = config;
		this.hass = hass;

		if (
			!this.isUpdating &&
			(!this.lastEventsUpdateTime || dayjs().diff(this.lastEventsUpdateTime, 'seconds') > this.config.refreshInterval)
		) {
			this.parent.showLoader = true;
			this.parent.requestUpdate();
			this.hiddenEvents = 0;
			this.isUpdating = true;
			try {
				const plannerConfig = { ...this.config };
				if (!plannerConfig.plannerRollingWeek) {
					plannerConfig._showPastEvents = true;
				}
				const { events, failedEvents } = await getPlannerMode(plannerConfig, this.hass);
				this.events = events[0];
				this.hiddenEvents = events[1];
				this.failedEvents = failedEvents;

				// Force fill days for Planner Mode
				const { start, end } = getPlannerDateRange(this.config);
				this.events = setNoEventDays(plannerConfig, this.events, start, end.add(1, 'day'));

				this.events = groupEventsByDay(this.events);
			} catch (error) {
				console.log(error);
				this.errorMessage = html`${localize('errors.update_card')}
					<a
						href="https://docs.totaldebug.uk/atomic-calendar-revive/overview/faq.html"
						target="${this.config.linkTarget}"
						>See Here</a
					>`;
			}

			this.lastEventsUpdateTime = dayjs();
			this.isUpdating = false;
			this.parent.showLoader = false;
			this.parent.requestUpdate();
		}
	}

	render(): TemplateResult {
		if (this.errorMessage !== html`` && (!this.events || this.events.length === 0)) {
			return this.errorMessage;
		}

		if (!this.events) {
			return this.errorMessage;
		}

		// Get unique calendars from config
		const calendars = this.config.entities.map((entity) => {
			const stateObj = this.hass.states[entity.entity];
			return {
				id: entity.entity,
				name: entity.name || stateObj?.attributes?.friendly_name || entity.entity,
				color: entity.color || 'var(--primary-color)',
			};
		});

		// Render Header Row (Days)
		const dayHeaders = this.events.map((dayEvents: [EventClass]) => {
			const date = dayEvents[0].startDateTime;
			return html`<div class="planner-header">
				<div class="day-name">${date.format('dddd')}</div>
				<div class="day-date">${date.format('D MMM')}</div>
			</div>`;
		});

		// Render Rows (Calendars)
		const calendarRows = calendars.map((cal) => {
			const calendarLabel = html`<div class="planner-day-label" style="color: ${cal.color}">${cal.name}</div>`;

			const dayCells = this.events.map((dayEvents: [EventClass]) => {
				const eventsForCal = dayEvents.filter((e) => e.entity.entity_id === cal.id && !e.isEmpty);
				return html`<div class="planner-cell">
					${eventsForCal.map(
						(event) => html`
							<div class="planner-event">
								${getTitleHTML(this.config, event, this.hass, 'Planner')}
								<div class="planner-event-time">
									${event.isAllDayEvent
										? localize('common.fullDayEventText')
										: `${event.startDateTime.format('LT')}${this.config.showEndTime ? ` - ${event.endDateTime.format('LT')}` : ''}`}
								</div>
							</div>
						`,
					)}
				</div>`;
			});

			return html`<div class="planner-row">${calendarLabel} ${dayCells}</div>`;
		});

		return html`
			<div class="planner-container">
				<div class="planner-header-row">
					<div class="planner-corner"></div>
					${dayHeaders}
				</div>
				${calendarRows}
			</div>
		`;
	}
}
