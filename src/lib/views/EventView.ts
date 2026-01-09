import dayjs from 'dayjs';
import { TemplateResult, html } from 'lit';

import { handleAction } from '../../helpers/handle-action';
import localize from '../../localize/localize';
import { atomicCardConfig } from '../../types/config';
import { HomeAssistant } from '../../types/homeassistant';
import { getCurrDayAndMonth, getDescription, getLocationHTML, getTitleHTML, setNoEventDays } from '../common.html';
import EventClass from '../event.class';
import { getEventMode, groupEventsByDay } from '../event.func';
import { ILoaderHost } from '../loader-host.interface';
import { ICalendarView } from '../view.interface';

export class EventView implements ICalendarView {
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
				const { events, failedEvents } = await getEventMode(this.config, this.hass);
				this.events = events[0];
				this.hiddenEvents = events[1];
				this.failedEvents = failedEvents;
				// Check no event days and display
				if (this.config.showNoEventDays) {
					this.events = setNoEventDays(this.config, this.events);
				}
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

		if (this.events.length === 0 && (this.config.maxDaysToShow == 1 || this.config.maxDaysToShow == 0)) {
			return html`${this.config.noEventText ?? localize('common.noEventText')}`;
		} else if (this.events.length === 0) {
			return html`${this.config.noEventsForNextDaysText ?? localize('common.noEventsForNextDaysText')}`;
		}

		// Move finished events up to the top
		if (dayjs(this.events[0][0]).isSame(dayjs(), 'day') && this.events[0].length > 1) {
			let i = 1;
			while (i < this.events[0].length) {
				if (this.events[0][i].isFinished && !this.events[0][i - 1].isFinished) {
					[this.events[0][i], this.events[0][i - 1]] = [this.events[0][i - 1], this.events[0][i]];
					if (i > 1) {
						i--;
					}
				} else {
					i++;
				}
			}
		}

		// If there are no events, post fake event with "No Events Today" text
		if (
			this.config.showNoEventsForToday &&
			this.events[0][0].startDateTime.isAfter(dayjs().add(this.config.startDaysAhead!, 'day').startOf('day'), 'day') &&
			this.events[0].length > 0
		) {
			const emptyEv = {
				eventClass: '',
				config: '',
				start: { dateTime: dayjs().endOf('day') },
				end: { dateTime: dayjs().endOf('day') },
				summary: this.config.noEventText ?? localize('common.noEventText'),
				isFinished: false,
			};
			const emptyEvent = new EventClass(emptyEv, this.config);
			emptyEvent.isEmpty = true;
			const d: unknown[] = [];
			d.push(emptyEvent);
			this.events.unshift(d);
		}

		let currentWeek = 54;
		const htmlDays = this.events.map((day: [EventClass], di) => {
			const weekNumberResults = this.getWeekNumberHTML(day, currentWeek);
			currentWeek = weekNumberResults.currentWeek;

			const dayEvents = day;

			const htmlEvents = dayEvents.map((event: EventClass, i, arr) => {
				const dayWrap = i == 0 && di > 0 ? 'daywrap' : '';
				const isEventNext = !!(
					di == 0 &&
					event.startDateTime.isAfter(dayjs()) &&
					(i == 0 || !arr[i - 1].startDateTime.isAfter(dayjs()))
				);
				//show line before next event
				const currentEventLine =
					this.config.showCurrentEventLine && isEventNext
						? html`<div class="eventBar">
								<hr class="event" style="--event-bar-color: ${this.config.eventBarColor} " />
							</div>`
						: ``;

				const calColor =
					typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this.config.defaultCalColor;

				//show calendar name
				const eventCalName =
					event.entityConfig.name && this.config.showCalendarName
						? html`<div class="event-cal-name" style="color: ${calColor};">
								<ha-icon icon="mdi:calendar" class="event-cal-name-icon"></ha-icon>&nbsp;${event.originName}
							</div>`
						: ``;

				//show current event progress bar
				let progressBar = html``;
				if (
					di == 0 &&
					((event.isRunning && this.config.showFullDayProgress && event.isAllDayEvent) ||
						(event.isRunning && !event.isAllDayEvent && this.config.showProgressBar))
				) {
					const eventDuration = event.endDateTime.diff(event.startDateTime, 'minutes');
					const eventProgress = dayjs().diff(event.startDateTime, 'minutes');
					const eventPercentProgress = (eventProgress * 100) / eventDuration / 100;
					progressBar = html`<progress
						style="--progress-bar: ${this.config.progressBarColor}; --progress-bar-bg: ${this.config
							.progressBarBackgroundColor};"
						value="${eventPercentProgress}"
						max="1"
					></progress>`;
				}

				const finishedEventsStyle =
					event.isFinished && this.config.dimFinishedEvents
						? `opacity: ` + this.config.finishedEventOpacity + `; filter: ` + this.config.finishedEventFilter + `;`
						: ``;

				// Show the hours
				const hoursHTML = this.config.showHours
					? html`<div class="hours">${this.getHoursHTML(this.config, event)}</div>`
					: html``;

				// Show the relative time
				let timeUntilRemaining;
				if (this.config.showRelativeTime || this.config.showTimeRemaining) {
					const now = dayjs();
					timeUntilRemaining = html`<div class="relative-time time-remaining">
						${this.config.showRelativeTime && event.startDateTime.isAfter(now, 'minutes')
							? `(${event.startDateTime.fromNow()})`
							: this.config.showTimeRemaining &&
								  event.startDateTime.isBefore(now, 'minutes') &&
								  event.endDateTime.isAfter(now, 'minutes')
								? `${dayjs.duration(event.endDateTime.diff(now)).humanize()}`
								: ''}
					</div>`;
				} else {
					timeUntilRemaining = html``;
				}

				const lastEventStyle = !this.config.compactMode && i == arr.length - 1 ? 'padding-bottom: 8px;' : '';

				const showDatePerEvent = this.config.showDatePerEvent ? true : !!(i === 0);

				// check and set the date format
				const eventDate = showDatePerEvent
					? html`<div class="event-date-day">${event.startTimeToShow.format(this.config.eventDateFormat)}</div>`
					: html``;

				const dayClassTodayEvent = event.startTimeToShow.isSame(dayjs(), 'day') ? `current-day` : ``;
				const compactMode = this.config.compactMode ? `compact` : ``;
				const hideDate = this.config.showEventDate ? `` : `hide-date`;

				const eventLeft =
					this.config.showEventDate === true
						? html`<div class="event-left ${dayClassTodayEvent}">
								<!--Show the event date, see eventDateFormat-->
								${eventDate}
							</div>`
						: html``;
				return html`<div
					class="single-event-container ${compactMode} ${dayWrap} ${hideDate}"
					style="${lastEventStyle}"
					@click="${(e: Event) =>
						handleAction(e.currentTarget as HTMLElement, this.hass, this.config, 'tap', event.entity.entity_id)}"
				>
					${currentEventLine} ${eventLeft}
					<div class="event-right" style="${finishedEventsStyle}">
						<div class="event-right-top">
							${getTitleHTML(this.config, event, this.hass, 'Event')}
							<div class="event-location">
								${getLocationHTML(this.config, event)} ${eventCalName} ${this.config.hoursOnSameLine ? hoursHTML : ''}
							</div>
						</div>
						<div class="event-right-bottom">${this.config.hoursOnSameLine ? '' : hoursHTML} ${timeUntilRemaining}</div>
						${getDescription(this.config, event)} ${progressBar}
					</div>
				</div>`;
			});
			return html`${this.config.showWeekNumber ? weekNumberResults.currentWeekHTML : ''}${htmlEvents}`;
		});
		const eventnotice = this.config.showHiddenText
			? this.hiddenEvents > 0
				? this.hiddenEvents + ' ' + (this.config.hiddenEventText ?? localize('common.hiddenEventText'))
				: ''
			: '';
		return html`${htmlDays} <span class="hidden-events">${eventnotice}</span>`;
	}

	private getHoursHTML(config: atomicCardConfig, event: EventClass) {
		const today = dayjs();
		if (event.isEmpty) {
			return html`<div>&nbsp;</div>`;
		}
		// if the option showAllDayHours is set to false, dont show "all day" text
		if (!config.showAllDayHours && event.isAllDayEvent) {
			return html``;
		}

		// If showEndTime is false, simplify the output
		if (config.showEndTime === false) {
			if (event.isAllDayEvent) {
				return html`${config.fullDayEventText ?? localize('common.fullDayEventText')}`;
			}
			return html`${event.startDateTime.format('LT')}`;
		}

		// full day events, no hours set
		// 1. Starts any day, ends later -> 'All day, end date'

		if (event.isAllDayEvent && event.isMultiDay && event.startDateTime.isAfter(today, 'day')) {
			return html`
				${config.fullDayEventText ?? localize('common.fullDayEventText')},
				${(config.untilText! ?? localize('common.untilText')).toLowerCase()} ${getCurrDayAndMonth(event.endDateTime)}
			`;
		}
		// 2. Is an all day event, over multiple days and the start time is before today or the
		// end time is after today -> 'All dat, until end date'
		else if (
			event.isAllDayEvent &&
			event.isMultiDay &&
			(event.startDateTime.isBefore(today, 'day') || event.endDateTime.isAfter(today, 'day'))
		) {
			return html`
				${config.fullDayEventText ?? localize('common.fullDayEventText')},
				${(config.untilText! ?? localize('common.untilText')).toLowerCase()} ${getCurrDayAndMonth(event.endDateTime)}
			`;
		}
		// 3. Is an all day event, not matching 1 or 2 -> 'All Day'
		else if (event.isAllDayEvent) {
			return html`${config.fullDayEventText ?? localize('common.fullDayEventText')}`;
		}
		// 4. Starts before today, ends after today -> 'Until end date'
		else if (event.startDateTime.isBefore(today, 'day') && event.endDateTime.isAfter(today, 'day')) {
			return html`${config.untilText! ?? localize('common.untilText')} ${getCurrDayAndMonth(event.endDateTime)}`;
		}
		// 5. starts before today, ends today -> 'Until end time'
		else if (
			(event.startDateTime.isBefore(today, 'day') && event.endDateTime.isSame(today, 'day')) ||
			(event.isLastDay && event.endDateTime.isSame(today, 'day'))
		) {
			return html`${config.untilText! ?? localize('common.untilText')} ${event.endDateTime.format('LT')} `;
		}
		// 6. Does not start before today, ends after start
		else if (!event.startDateTime.isBefore(today, 'day') && event.endDateTime.isAfter(event.startDateTime, 'day')) {
			return html`${event.startDateTime.format('LT')},
			${(config.untilText! ?? localize('common.untilText')).toLowerCase()} ${getCurrDayAndMonth(event.endDateTime)}
			${event.endDateTime.format('HH:mm')}`;
		}
		// 7. anything that doesnt fit -> 'start time - end time'
		else {
			return html`${event.startDateTime.format('LT')} - ${event.endDateTime.format('LT')} `;
		}
	}

	private getWeekNumberHTML(day: [EventClass], currentWeek: number) {
		let currentWeekHTML = html``;
		if (currentWeek != day[0].startDateTime.isoWeek()) {
			if (day[0].startDateTime.isBefore(dayjs())) {
				currentWeek = dayjs().isoWeek();
			} else {
				currentWeek = day[0].startDateTime.isoWeek();
			}

			currentWeekHTML = html`<div class="week-number">${localize('ui.common.week')} ${currentWeek.toString()}</div>`;
			return { currentWeekHTML, currentWeek };
		} else {
			return { currentWeekHTML, currentWeek };
		}
	}
}
