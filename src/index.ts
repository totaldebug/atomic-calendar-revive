import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localeData from 'dayjs/plugin/localeData';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import week from 'dayjs/plugin/weekOfYear';
import { CSSResultGroup, LitElement, TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './locale.dayjs';

dayjs.extend(updateLocale);
dayjs.extend(relativeTime);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(LocalizedFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(week);
dayjs.extend(duration);
dayjs.extend(timezone);

// Import Card Editor
import './editor';
import { CARD_VERSION } from './const';
import defaultConfig from './defaults';
import { getDefaultConfig } from './helpers/get-default-config';
import { setHass } from './helpers/globals';
import { registerCustomCard } from './helpers/register-custom-card';
import CalendarDay from './lib/calendar.class';
import { getCalendarDescriptionHTML, getCalendarLocationHTML, handleCalendarIcons } from './lib/calendarMode.html';
import { getDate, getTitleHTML, setNoEventDays, showCalendarLink } from './lib/common.html';
import EventClass from './lib/event.class';
import { getCalendarMode, getEventMode, groupEventsByDay } from './lib/event.func';
import { getDescription, getHoursHTML, getLocationHTML, getWeekNumberHTML } from './lib/eventMode.html';
import { getMonthDaysHTML } from './lib/monthMode.html';
import { getWeekViewHTML } from './lib/weekMode.html';
import localize from './localize/localize';
import { styles } from './style';
import { atomicCardConfig } from './types/config';
import { HomeAssistant, TimeFormat } from './types/homeassistant';
import { LovelaceCardEditor } from './types/lovelace';

@customElement('atomic-calendar-revive')
export class AtomicCalendarRevive extends LitElement {
	@property() public hass!: HomeAssistant;
	@property() private _config!: atomicCardConfig;
	@property() private content;
	@property() private selectedMonth;
	@property() public lastUpdateTime: dayjs.Dayjs | undefined;
	@property() public month: any;
	@property() public weekEvents?: EventClass[];

	lastCalendarUpdateTime!: dayjs.Dayjs;
	lastEventsUpdateTime!: dayjs.Dayjs;
	lastHTMLUpdateTime!: dayjs.Dayjs;
	events!: object | unknown[];
	shouldUpdateHtml: boolean;
	errorMessage: TemplateResult;
	modeToggle: string;
	refreshCalEvents: boolean;
	monthToGet: string;
	showLoader: boolean;
	hiddenEvents: number;
	eventSummary: TemplateResult | void | TemplateResult<1>[];
	firstrun: boolean;
	isUpdating: boolean;
	clickedDate!: dayjs.Dayjs;
	language: string;
	failedEvents!: object | unknown[];

	constructor() {
		super();

		this.content = html``;
		this.shouldUpdateHtml = true;
		this.errorMessage = html``;
		this.modeToggle = '';
		this.selectedMonth = dayjs();
		this.refreshCalEvents = true;
		this.monthToGet = dayjs().format('MM');
		this.showLoader = false;
		this.eventSummary = html`&nbsp;`;
		this.firstrun = true;
		this.isUpdating = false;
		this.language = '';
		this.hiddenEvents = 0;
	}

	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		return document.createElement('atomic-calendar-revive-editor') as LovelaceCardEditor;
	}

	public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
		// get available energy entities
		return getDefaultConfig(hass);
	}

	public setConfig(config: atomicCardConfig): void {
		setHass(this.hass);
		if (!config) {
			throw new Error(localize('errors.invalid_configuration'));
		}
		if (!config.entities || !config.entities.length) {
			throw new Error(localize('errors.no_entities'));
		}

		const customConfig: atomicCardConfig = JSON.parse(JSON.stringify(config));

		this._config = {
			...defaultConfig,
			...customConfig,
		};

		this.modeToggle = this._config.viewStyle!;

		if (typeof this._config.entities === 'string') {
			this._config.entities = [
				{
					entity: config.entities,
				},
			];
		}
		this._config.entities.forEach((entity, i) => {
			if (typeof entity === 'string') {
				this._config.entities[i] = {
					entity: entity,
				};
			}
		});
	}
	updateMonthHTML() {
		if (!this.month) {
			this.content = html`<div class="loader">
				${this.showLoader ? html`<ha-circular-progress active></ha-circular-progress>` : ''}
			</div>`;
			return;
		}

		const weekDays = dayjs.weekdaysShort(true);
		const htmlDayNames = weekDays.map((day) => html`<div class="month-weekday">${day}</div>`);

		this.content = html`
			<div class="calTitleContainer">${this.getCalendarHeaderHTML()}</div>
			<div class="month-view-container">
				<div class="month-weekdays">${htmlDayNames}</div>
				<div class="month-days-grid">${getMonthDaysHTML(this.month, this._config)}</div>
			</div>
		`;
	}

	updateWeekHTML() {
		if (!this.weekEvents) {
			this.content = html`<div class="loader">
				${this.showLoader ? html`<ha-circular-progress active></ha-circular-progress>` : ''}
			</div>`;
			return;
		}

		this.content = html`
			<div class="week-view-container" style="--days-to-show: ${this._config.maxDaysToShow || 7}">
				${getWeekViewHTML(this._config, this.weekEvents)}
			</div>
		`;
	}

	protected render(): TemplateResult | void {
		setHass(this.hass);
		if (this.firstrun) {
			this.language =
				typeof this._config.language != 'undefined'
					? this._config.language!
					: this.hass.locale
						? this.hass.locale.language.toLowerCase()
						: this.hass.language.toLowerCase();

			dayjs.locale(this.language);

			const timeFormat =
				this.hass.locale?.time_format == TimeFormat.am_pm
					? 'hh:mma'
					: this.hass.locale?.time_format == TimeFormat.twenty_four
						? 'HH:mm'
						: dayjs().localeData().longDateFormat('LT');
			dayjs.updateLocale(this.language, {
				weekStart: this._config.firstDayOfWeek!,
				formats: {
					LT: timeFormat,
				},
			});

			console.groupCollapsed(
				`%c atomic-calendar-revive %c ${localize('common.version')}: ${CARD_VERSION}`,
				'color: white; background: #484848; font-weight: 700;',
				'color: white; background: #cc5500; font-weight: 700;',
			);
			console.log(`'Language:'`, `${this.language}`);
			console.log(`'HASS Timezone:'`, `${this.hass.config.time_zone}`);
			console.log(`'DayJS Timezone:'`, `${dayjs.tz.guess()}`);
			console.groupEnd();

			this.selectedMonth = dayjs();
			this.monthToGet = dayjs().format('MM');
		}
		if (!this._config || !this.hass) {
			return html``;
		}
		this.updateCard();

		const compactMode = this._config.compactMode ? 'compact' : '';

		return html`<ha-card
			class="cal-card"
			style="${this._config.compactMode ? 'line-height: 80%;' : ''} --card-height: ${this._config.cardHeight}"
		>
			${this._config.name || this._config.showDate || (this.showLoader && this._config.showLoader)
				? html` <div class="header ${compactMode}">
						${this._config.name
							? html`<div class="header-name ${compactMode}" @click="${() => this.handleToggle()}">
									${this._config.name}
								</div>`
							: ''}
						${this.showLoader && this._config.showLoader ? html`<div class="loader"></div>` : ''}
						${this._config.showDate ? html`<div class="header-date ${compactMode}">${getDate(this._config)}</div>` : ''}
					</div>`
				: ''}
			<div class="cal-eventContainer" style="padding-top: 4px;">${this.content}</div>
		</ha-card>`;
	}

	/**
	 * Updates the entire card
	 */
	async updateCard() {
		this.firstrun = false;

		// Determine if a data refresh is needed, regardless of the current mode
		const now = dayjs();
		const needsRefresh =
			!this.lastUpdateTime || now.diff(this.lastUpdateTime, 'seconds') > this._config.refreshInterval;

		if (this.isUpdating) {
			return;
		}

		// 1. DATA REFRESH LOGIC
		if (needsRefresh && !this.isUpdating) {
			this.isUpdating = true;
			this.showLoader = true;

			try {
				// Fetch data based on the current mode
				switch (this.modeToggle) {
					case 'Event':
						const { events, failedEvents } = await getEventMode(this._config, this.hass);
						let processedEvents = events[0];
						this.hiddenEvents = events[1];
						this.failedEvents = failedEvents;
						// Re-add the original processing logic here
						if (this._config.showNoEventDays) {
							processedEvents = setNoEventDays(this._config, processedEvents);
						}
						this.events = groupEventsByDay(processedEvents);
						break;

					case 'Calendar':
					case 'Month':
						this.month = await getCalendarMode(this._config, this.hass, this.selectedMonth);
						break;

					case 'Week':
						const weekData = await getEventMode(this._config, this.hass);
						this.weekEvents = weekData.events[0];
						break;
				}

				this.lastUpdateTime = now; // Update the timestamp after a successful fetch
			} catch (error) {
				console.error('Error updating card:', error);
				this.errorMessage = html`Could not update card. See console for details.`;
			} finally {
				this.isUpdating = false;
				this.showLoader = false;
			}
		}

		// 2. RENDERING LOGIC
		// This part now just renders the view using pre-fetched data
		switch (this.modeToggle) {
			case 'Event':
				// The data is already processed, so we just call the render function
				this.updateEventsHTML(this.events);
				break;
			case 'compactCalendar':
				this.updateCalendarHTML();
				break;
			case 'fullCalendar':
				this.updateMonthHTML();
				break;
			case 'Schedule':
				this.updateWeekHTML();
				break;
		}
	}

	handleToggle() {
		if (this._config.enableModeChange) {
			this.modeToggle == 'Event' ? (this.modeToggle = 'Calendar') : (this.modeToggle = 'Event');
			this.requestUpdate();
		}
	}

	static get styles(): CSSResultGroup {
		return styles;
	}

	// The height of your card. Home Assistant uses this to automatically
	// distribute all cards over the available columns.
	getCardSize() {
		return this._config.entities.length + 1;
	}

	_toggle(state) {
		this.hass!.callService('homeassistant', 'toggle', {
			entity_id: state.entity_id,
		});
	}

	/**
	 * update Events main HTML
	 *
	 */
	updateEventsHTML(days) {
		let htmlDays = '';

		/**
		 * If there is an error, put the message as content
		 */
		if (!days) {
			this.content = this.errorMessage;
			return;
		}

		/**
		 * If there are no events, put some text in
		 */
		if (days.length === 0 && (this._config.maxDaysToShow == 1 || this._config.maxDaysToShow == 0)) {
			this.content = this._config.noEventText ?? localize('common.noEventText');
			return;
		} else if (days.length === 0) {
			this.content = this._config.noEventsForNextDaysText ?? localize('common.noEventsForNextDaysText');
			return;
		}

		/**
		 * Move finished events up to the top
		 */
		if (dayjs(days[0][0]).isSame(dayjs(), 'day') && days[0].length > 1) {
			let i = 1;
			while (i < days[0].length) {
				if (days[0][i].isFinished && !days[0][i - 1].isFinished) {
					[days[0][i], days[0][i - 1]] = [days[0][i - 1], days[0][i]];
					if (i > 1) {
						i--;
					}
				} else {
					i++;
				}
			}
		}
		/**
		 * If there are no events, post fake event with "No Events Today" text
		 */
		if (
			this._config.showNoEventsForToday &&
			days[0][0].startDateTime.isAfter(dayjs().add(this._config.startDaysAhead!, 'day').startOf('day'), 'day') &&
			days[0].length > 0
		) {
			const emptyEv = {
				eventClass: '',
				config: '',
				start: { dateTime: dayjs().endOf('day') },
				end: { dateTime: dayjs().endOf('day') },
				summary: this._config.noEventText ?? localize('common.noEventText'),
				isFinished: false,
			};
			const emptyEvent = new EventClass(emptyEv, this._config);
			emptyEvent.isEmpty = true;
			const d: unknown[] = [];
			d.push(emptyEvent);
			days.unshift(d);
		}

		/**
		 * Loop through each day an process the events
		 */
		let currentWeek = 54;
		htmlDays = days.map((day: [EventClass], di) => {
			const weekNumberResults = getWeekNumberHTML(day, currentWeek);
			currentWeek = weekNumberResults.currentWeek;

			const dayEvents = day;

			/**
			 * Loop through each event and add html
			 */
			const htmlEvents = dayEvents.map((event: EventClass, i, arr) => {
				const dayWrap = i == 0 && di > 0 ? 'daywrap' : '';
				const isEventNext = !!(
					di == 0 &&
					event.startDateTime.isAfter(dayjs()) &&
					(i == 0 || !arr[i - 1].startDateTime.isAfter(dayjs()))
				);
				//show line before next event
				const currentEventLine =
					this._config.showCurrentEventLine && isEventNext
						? html`<div class="eventBar">
								<hr class="event" style="--event-bar-color: ${this._config.eventBarColor} " />
							</div>`
						: ``;

				const calColor =
					typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this._config.defaultCalColor;

				//show calendar name
				const eventCalName =
					event.entityConfig.name && this._config.showCalendarName
						? html`<div class="event-cal-name" style="color: ${calColor};">
								<ha-icon icon="mdi:calendar" class="event-cal-name-icon"></ha-icon>&nbsp;${event.originName}
							</div>`
						: ``;

				//show current event progress bar
				let progressBar = html``;
				if (
					di == 0 &&
					((event.isRunning && this._config.showFullDayProgress && event.isAllDayEvent) ||
						(event.isRunning && !event.isAllDayEvent && this._config.showProgressBar))
				) {
					const eventDuration = event.endDateTime.diff(event.startDateTime, 'minutes');
					const eventProgress = dayjs().diff(event.startDateTime, 'minutes');
					const eventPercentProgress = (eventProgress * 100) / eventDuration / 100;
					progressBar = html`<progress
						style="--progress-bar: ${this._config.progressBarColor}; --progress-bar-bg: ${this._config
							.progressBarBackgroundColor};"
						value="${eventPercentProgress}"
						max="1"
					></progress>`;
				}

				const finishedEventsStyle =
					event.isFinished && this._config.dimFinishedEvents
						? `opacity: ` + this._config.finishedEventOpacity + `; filter: ` + this._config.finishedEventFilter + `;`
						: ``;

				// Show the hours
				const hoursHTML = this._config.showHours
					? html`<div class="hours">${getHoursHTML(this._config, event)}</div>`
					: html``;

				// Show the relative time
				let timeUntilRemaining;
				if (this._config.showRelativeTime || this._config.showTimeRemaining) {
					const now = dayjs();
					timeUntilRemaining = html`<div class="relative-time time-remaining">
						${this._config.showRelativeTime && event.startDateTime.isAfter(now, 'minutes')
							? `(${event.startDateTime.fromNow()})`
							: this._config.showTimeRemaining &&
								  event.startDateTime.isBefore(now, 'minutes') &&
								  event.endDateTime.isAfter(now, 'minutes')
								? `${dayjs.duration(event.endDateTime.diff(now)).humanize()}`
								: ''}
					</div>`;
				} else {
					timeUntilRemaining = html``;
				}

				const lastEventStyle = !this._config.compactMode && i == arr.length - 1 ? 'padding-bottom: 8px;' : '';

				const showDatePerEvent = this._config.showDatePerEvent ? true : !!(i === 0);

				// check and set the date format
				const eventDate = showDatePerEvent
					? html`<div class="event-date-day">${event.startTimeToShow.format(this._config.eventDateFormat)}</div>`
					: html``;

				const dayClassTodayEvent = event.startTimeToShow.isSame(dayjs(), 'day') ? `current-day` : ``;
				const compactMode = this._config.compactMode ? `compact` : ``;
				const hideDate = this._config.showEventDate ? `` : `hide-date`;

				const eventLeft =
					this._config.showEventDate === true
						? html`<div class="event-left ${dayClassTodayEvent}">
								<!--Show the event date, see eventDateFormat-->
								${eventDate}
							</div>`
						: html``;
				return html`<div class="single-event-container ${compactMode} ${dayWrap} ${hideDate}" style="${lastEventStyle}">
					${eventLeft}
					<div class="event-right" style="${finishedEventsStyle}">
						${currentEventLine}
						<div class="event-right-top">
							${getTitleHTML(this._config, event, this.hass, this.modeToggle)}
							<div class="event-location">
								${getLocationHTML(this._config, event)} ${eventCalName} ${this._config.hoursOnSameLine ? hoursHTML : ''}
							</div>
						</div>
						<div class="event-right-bottom">${this._config.hoursOnSameLine ? '' : hoursHTML} ${timeUntilRemaining}</div>
						${getDescription(this._config, event)} ${progressBar}
					</div>
				</div>`;
			});
			return html`${this._config.showWeekNumber ? weekNumberResults.currentWeekHTML : ''}${htmlEvents}`;
		});
		const eventnotice = this._config.showHiddenText
			? this.hiddenEvents > 0
				? this.hiddenEvents + ' ' + (this._config.hiddenEventText ?? localize('common.hiddenEventText'))
				: ''
			: '';
		this.content = html`${htmlDays} <span class="hidden-events">${eventnotice}</span>`;
	}

	/**
	 * change month in calendar mode
	 *
	 */
	handleMonthChange(i) {
		this.selectedMonth = this.selectedMonth.add(i, 'month');
		this.monthToGet = this.selectedMonth.format('M');
		this.eventSummary = html`&nbsp;`;
		this.refreshCalEvents = true;
	}

	/**
	 * create html calendar header
	 *
	 */
	getCalendarHeaderHTML() {
		return html`<div class="calDateSelector">
			<ha-icon-button
				class="prev"
				style="--mdc-icon-color: ${this._config.calDateColor}"
				.path=${mdiChevronLeft}
				.label=${this.hass.localize('ui.common.previous')}
				@click="${() => this.handleMonthChange(-1)}"
			>
			</ha-icon-button>
			<span class="date" style="text-decoration: none; color: ${this._config.calDateColor};">
				${this.selectedMonth.format('MMMM')} ${this.selectedMonth.format('YYYY')}
			</span>
			<ha-icon-button
				class="next"
				style="--mdc-icon-color: ${this._config.calDateColor}"
				.path=${mdiChevronRight}
				.label=${this.hass.localize('ui.common.next')}
				@click="${() => this.handleMonthChange(1)}"
			>
			</ha-icon-button>
		</div>`;
	}

	/**
	 * show events summary under the calendar
	 *
	 */
	handleCalendarEventSummary(day: CalendarDay, fromClick) {
		if (fromClick) {
			this.clickedDate = day.date;
		}
		const dayEvents = day.allEvents;

		this.eventSummary = dayEvents.map((event: EventClass) => {
			const eventColor =
				typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this._config.defaultCalColor;
			const finishedEventsStyle =
				event.isFinished && this._config.dimFinishedEvents
					? `opacity: ` + this._config.finishedEventOpacity + `; filter: ` + this._config.finishedEventFilter + `;`
					: ``;

			// is it a full day event? if so then use border instead of bullet else, use a bullet
			if (event.isAllDayEvent) {
				const bulletType: string = event.isDeclined ? 'summary-fullday-div-declined' : 'summary-fullday-div-accepted';

				return html`<div class="${bulletType}" style="border-color:  ${eventColor}; ${finishedEventsStyle}">
					<div aria-hidden="true">
						${getTitleHTML(this._config, event, this.hass, this.modeToggle)}
						${getCalendarLocationHTML(this._config, event)}
						${this._config.calShowDescription ? getCalendarDescriptionHTML(this._config, event) : ''}
					</div>
				</div>`;
			} else {
				const eventTime = this._config.showHours
					? html`<div class="hours">${event.startDateTime.format('LT')}-${event.endDateTime.format('LT')}</div>`
					: '';

				const bulletType: string = event.isDeclined ? 'bullet-event-div-declined' : 'bullet-event-div-accepted';

				return html`
					<div class="summary-event-div" style="color: ${eventColor}; ${finishedEventsStyle}">
						<div class="${bulletType}" style="border-color: ${eventColor}"></div>
						${eventTime} - ${getTitleHTML(this._config, event, this.hass, this.modeToggle)}
						${getCalendarLocationHTML(this._config, event)}
						${this._config.calShowDescription ? getCalendarDescriptionHTML(this._config, event) : ''}
					</div>
				`;
			}
		});
		this.requestUpdate();
	}

	/**
	 * create calendar mode html cells
	 *
	 */
	getCalendarDaysHTML(month) {
		let showLastRow = true;
		if (!this._config.showLastCalendarWeek && !dayjs(month[35].date).isSame(this.selectedMonth, 'month')) {
			showLastRow = false;
		}

		return month.map((day: CalendarDay, i: number) => {
			const dayDate = dayjs(day.date);
			const dayStyleOtherMonth = dayDate.isSame(this.selectedMonth, 'month') ? '' : `differentMonth`;
			const dayClassToday = dayDate.isSame(dayjs(), 'day') ? `currentDay` : ``;
			const dayStyleSat = dayDate.isoWeekday() == 6 ? `weekendSat` : ``;
			const dayStyleSun = dayDate.isoWeekday() == 7 ? `weekendSun` : ``;
			const dayStyleClicked = dayDate.isSame(dayjs(this.clickedDate), 'day')
				? `background-color: ${this._config.calActiveEventBackgroundColor};`
				: ``;

			if (dayDate.isSame(dayjs(), 'day') && !this.clickedDate) {
				this.handleCalendarEventSummary(day, false);
			}
			if (i < 35 || showLastRow) {
				return html`
					${i % 7 === 0 ? html`<tr class="cal"></tr>` : ''}
					<td
						@click="${() => this.handleCalendarEventSummary(day, true)}"
						class="cal ${dayStyleSat} ${dayStyleSun} ${dayStyleOtherMonth}"
						style="${dayStyleClicked} --cal-grid-color: ${this._config.calGridColor}; --cal-day-color: ${this._config
							.calDayColor}"
					>
						<div class="calDay">
							<div class="${dayClassToday}" style="position: relative; top: 5%;">${day.date.date()}</div>
							<div class="iconDiv">${handleCalendarIcons(day, this.hass)}</div>
						</div>
					</td>
					${i && i % 6 === 0 ? html`</tr>` : ''}
				`;
			} else {
				return html``;
			}
		});
	}

	/**
	 * update Calendar mode HTML
	 *
	 */
	async updateCalendarHTML() {
		if (
			this.refreshCalEvents ||
			!this.lastCalendarUpdateTime ||
			dayjs().diff(dayjs(this.lastCalendarUpdateTime), 'second') > this._config.refreshInterval
		) {
			this.lastCalendarUpdateTime = dayjs();
			this.showLoader = true;
			// get the calendar and all its events
			this.month = await getCalendarMode(this._config, this.hass, this.selectedMonth);
			this.refreshCalEvents = false;
			this.showLoader = false;
			this.hiddenEvents = 0;
		}
		const { month } = this;
		const weekDays = dayjs.weekdaysMin(true);
		const htmlDayNames = weekDays.map(
			(day) => html`<th class="cal" style="color:  ${this._config.calWeekDayColor};">${day}</th>`,
		);
		this.content = html`
			<div class="calTitleContainer">
				${this.getCalendarHeaderHTML()}${showCalendarLink(this._config, this.selectedMonth)}
			</div>
			<div class="calTableContainer">
				<table
					class="cal"
					style="color: ${this._config.eventTitleColor};--cal-border-color:${this._config.calGridColor}"
				>
					<thead>
						<tr>
							${htmlDayNames}
						</tr>
					</thead>
					<tbody>
						${this.getCalendarDaysHTML(month)}
					</tbody>
				</table>
			</div>
			<div class="summary-div">${this.eventSummary}</div>
		`;
	}
}

registerCustomCard({
	type: 'atomic-calendar-revive',
	name: 'Atomic Calendar Revive',
	description: 'An advanced calendar card for Home Assistant with Lovelace.',
});
