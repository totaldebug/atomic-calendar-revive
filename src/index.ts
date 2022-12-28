import { LitElement, html, TemplateResult, CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { formatTime } from './helpers/format-time';
import { groupEventsByDay, getEventMode, getCalendarMode } from './lib/event.func';
import { styles } from './style';

// DayJS for managing date information
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import relativeTime from 'dayjs/plugin/relativeTime';
import isoWeek from 'dayjs/plugin/isoWeek';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import week from 'dayjs/plugin/weekOfYear';
import './locale.dayjs';

dayjs.extend(updateLocale);
dayjs.extend(relativeTime);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(LocalizedFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(week);

// Import Card Editor
import './index-editor';

import CalendarDay from './lib/calendar.class';
import EventClass from './lib/event.class';

import {
	getCalendarDescriptionHTML,
	getCalendarLocationHTML,
	getCalendarTitleHTML,
	handleCalendarIcons,
} from './lib/calendarMode.html';
import {
	getDescription,
	getHoursHTML,
	getLocationHTML,
	getRelativeTime,
	getTitleHTML,
	getWeekNumberHTML,
} from './lib/eventMode.html';
import { getDate, setNoEventDays, showCalendarLink } from './lib/common.html';

import { atomicCardConfig } from './types';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';
import defaultConfig from './defaults';

class AtomicCalendarRevive extends LitElement {
	@property() public hass!: HomeAssistant;
	@property() private _config!: atomicCardConfig;
	@property() private content;
	@property() private selectedMonth;

	lastCalendarUpdateTime!: dayjs.Dayjs;
	lastEventsUpdateTime!: dayjs.Dayjs;
	lastHTMLUpdateTime!: dayjs.Dayjs;
	events!: {} | any[];
	shouldUpdateHtml: boolean;
	errorMessage: TemplateResult;
	modeToggle: string;
	refreshCalEvents: boolean;
	monthToGet: string;
	month!: Promise<any>;
	showLoader: boolean;
	hiddenEvents: number;
	eventSummary: TemplateResult | void | TemplateResult<1>[];
	firstrun: boolean;
	isUpdating: boolean;
	clickedDate!: dayjs.Dayjs;
	language: string;
	failedEvents!: {} | any[];

	constructor() {
		super();
		this.lastCalendarUpdateTime;
		this.lastEventsUpdateTime;
		this.lastHTMLUpdateTime;
		this.events;
		this.failedEvents;
		this.content = html``;
		this.shouldUpdateHtml = true;
		this.errorMessage = html``;
		this.modeToggle = '';
		this.selectedMonth = dayjs();
		this.refreshCalEvents = true;
		this.monthToGet = dayjs().format('MM');
		this.month;
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

	public static getStubConfig() {
		return {
			name: 'Calendar Card',
			enableModeChange: true,
		};
	}

	public setConfig(config: atomicCardConfig): void {
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

		this.modeToggle = this._config.defaultMode!;

		if (typeof this._config.entities === 'string')
			this._config.entities = [
				{
					entity: config.entities,
				},
			];
		this._config.entities.forEach((entity, i) => {
			if (typeof entity === 'string')
				this._config.entities[i] = {
					entity: entity,
				};
		});
	}

	protected render(): TemplateResult | void {
		if (this.firstrun) {
			this.language =
				typeof this._config.language != 'undefined'
					? this._config.language!
					: this.hass.locale
					? this.hass.locale.language.toLowerCase()
					: this.hass.language.toLowerCase();

			dayjs.locale(this.language);

			let timeFormat =
				typeof this._config.hoursFormat != 'undefined'
					? this._config.hoursFormat
					: this.hass.locale?.time_format == '12' || this.hass.locale?.time_format == '24'
					? formatTime(this.hass.locale)
					: dayjs().localeData().longDateFormat('LT');
			dayjs.updateLocale(this.language, {
				weekStart: this._config.firstDayOfWeek!,
				formats: {
					LT: timeFormat,
					LTS: 'HH:mm:ss',
					L: 'DD/MM/YYYY',
					LL: 'D MMMM YYYY',
					LLL: 'MMM D YYYY HH:mm',
					LLLL: 'dddd, D MMMM YYYY HH:mm',
				},
			});

			console.info(
				`%c atomic-calendar-revive %c ${localize('common.version')}: ${CARD_VERSION} %c ${this.language} `,
				'color: white; background: #484848; font-weight: 700;',
				'color: white; background: #cc5500; font-weight: 700;',
				'color: white; background: #303775; font-weight: 700;',
			);

			this.selectedMonth = dayjs();
			this.monthToGet = dayjs().format('MM');
		}
		if (!this._config || !this.hass) {
			return html``;
		}
		this.updateCard();

		return html` <ha-card class="cal-card" style="--card-height: ${this._config.cardHeight}">
			${this._config.name || this._config.showDate || (this.showLoader && this._config.showLoader)
				? html` <div class="header">
						${this._config.name
							? html`<div class="headerName" @click="${() => this.handleToggle()}">${this._config.name}</div>`
							: ''}
						${this.showLoader && this._config.showLoader ? html`<div class="loader"></div>` : ''}
						${this._config.showDate ? html`<div class="headerDate">${getDate(this._config)}</div>` : ''}
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

		// check if an update is needed
		if (!this.isUpdating && this.modeToggle == 'Event') {
			if (
				!this.lastEventsUpdateTime ||
				dayjs().diff(this.lastEventsUpdateTime, 'seconds') > this._config.refreshInterval
			) {
				this.showLoader = true;
				this.hiddenEvents = 0;
				this.isUpdating = true;
				try {
					const { events, failedEvents } = await getEventMode(this._config, this.hass);
					this.events = events;
					this.failedEvents = failedEvents;
					// Check no event days and display
					if (this._config.showNoEventDays) {
						this.events = setNoEventDays(this._config, this.events);
					}
					this.events = groupEventsByDay(this.events);
				} catch (error) {
					console.log(error);
					this.errorMessage = html`${localize('errors.update_card')}
						<a
							href="https://docs.totaldebug.uk/atomic-calendar-revive/overview/faq.html"
							target="${this._config.linkTarget}"
							>See Here</a
						>`;
					this.showLoader = false;
				}

				this.lastEventsUpdateTime = dayjs();
				this.updateEventsHTML(this.events);
				this.isUpdating = false;
				this.showLoader = false;
			}
		}
		// check if the mode was toggled, then load the correct
		// html render
		if (this.modeToggle == 'Event') this.updateEventsHTML(this.events);
		else await this.updateCalendarHTML();
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
		if (days.length === 0 && this._config.maxDaysToShow == 1) {
			this.content = this._config.noEventText;
			return;
		} else if (days.length === 0) {
			this.content = this._config.noEventsForNextDaysText;
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
					if (i > 1) i--;
				} else i++;
			}
		}
		/**
		 * If there are no events, post fake event with "No Events Today" text
		 */
		if (this._config.showNoEventsForToday && days[0][0].startDateTime.isAfter(dayjs(), 'day') && days[0].length > 0) {
			const emptyEv = {
				eventClass: '',
				config: '',
				start: { dateTime: dayjs().endOf('day') },
				end: { dateTime: dayjs().endOf('day') },
				summary: this._config.noEventText,
				isFinished: false,
				htmlLink: 'https://calendar.google.com/calendar/r/day?sf=true',
			};
			const emptyEvent = new EventClass(emptyEv, this._config);
			emptyEvent.isEmpty = true;
			const d: any[] = [];
			d.push(emptyEvent);
			days.unshift(d);
		}

		/**
		 * Loop through each day an process the events
		 */
		let currentWeek = 54;
		htmlDays = days.map((day: [EventClass], di) => {
			let weekNumberResults = getWeekNumberHTML(day, currentWeek);
			currentWeek = weekNumberResults.currentWeek;

			var dayEvents = day;

			/**
			 * Loop through each event and add html
			 */
			const htmlEvents = dayEvents.map((event: EventClass, i, arr) => {
				const dayWrap = i == 0 && di > 0 ? 'daywrap' : '';
				const isEventNext =
					di == 0 && event.startDateTime.isAfter(dayjs()) && (i == 0 || !arr[i - 1].startDateTime.isAfter(dayjs()))
						? true
						: false;
				//show line before next event
				const currentEventLine =
					this._config.showCurrentEventLine && isEventNext
						? html`<div class="eventBar">
								<ha-icon
									icon="mdi:circle"
									class="event-circle"
									style="color:  ${this._config.eventBarColor};"
								></ha-icon>
								<hr class="event" style="--event-bar-color: ${this._config.eventBarColor} " />
						  </div>`
						: ``;

				const calColor =
					typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this._config.defaultCalColor;

				//show calendar name
				const eventCalName =
					event.entityConfig.name && this._config.showCalendarName
						? html`<div class="event-cal-name" style="color: ${calColor};">
								<ha-icon icon="mdi:calendar" class="event-cal-name-icon"></ha-icon>&nbsp;${event.entityConfig.name}
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
					? html`<div
							class="hoursHTML"
							style="--time-color: ${this._config.timeColor}; --time-size: ${this._config.timeSize}%"
					  >
							${getHoursHTML(this._config, event)}
					  </div>`
					: '';

				// Show the relative time
				const relativeTime = this._config.showRelativeTime
					? html`<div
							class="relativeTime"
							style="--time-color: ${this._config.timeColor}; --time-size: ${this._config.timeSize}%"
					  >
							${getRelativeTime(event)}
					  </div>`
					: '';

				const lastEventStyle = i == arr.length - 1 ? 'padding-bottom: 8px;' : '';

				const showDatePer = this._config.showDatePerEvent
					? true
					: i === 0 ? true : false;

				// check and set the date format
				const eventDateFormat =
					this._config.europeanDate == true
						? html`${showDatePer ? event.startTimeToShow.format('DD') + ' ' : ''}${showDatePer && this._config.showMonth
								? event.startTimeToShow.format('MMM')
								: ''}`
						: html`${showDatePer && this._config.showMonth ? event.startTimeToShow.format('MMM') + ' ' : ''}${showDatePer
								? event.startTimeToShow.format('DD')
								: ''}`;

				const dayClassTodayEvent = event.startDateTime.isSame(dayjs(), 'day') ? `event-leftCurrentDay` : ``;


				const eventLeft = this._config.showEventDate == true
							? html`<td class="event-left" style="color: ${this._config.dateColor};font-size: ${this._config.dateSize}%;">
							<div class=${dayClassTodayEvent}>
								${showDatePer && this._config.showWeekDay ? event.startTimeToShow.format('ddd') : ''}
							</div><div class=${dayClassTodayEvent}>${eventDateFormat}</div>
							</td>`
							: html``;


				return html`<tr class="${dayWrap}" style="color:  ${this._config.dayWrapperLineColor};">${eventLeft}

		<td style="width: 100%;  ${finishedEventsStyle} ${lastEventStyle}">
			<div>${currentEventLine}</div>
				<div class="event-right">
					<div class="event-main">${getTitleHTML(this._config, event)}</div>
					<div class="event-location">${getLocationHTML(this._config, event)} ${eventCalName}</div>
				</div>
        <div class="event-right">${hoursHTML} ${relativeTime}</div>
				${getDescription(this._config, event)}</div>
				</div>
				${progressBar}
    </td>
	</tr>`;
			});
			var daysEvents = html`${this._config.showWeekNumber ? weekNumberResults.currentWeekHTML : ''}${htmlEvents}`;
			return daysEvents;
		});
		const eventnotice = this._config.showHiddenText
			? this.hiddenEvents > 0
				? this.hiddenEvents + ' ' + this._config.hiddenEventText
				: ''
			: '';
		this.content = html`<table>
				<tbody>
					${htmlDays}
				</tbody>
			</table>
			<span class="hidden-events">${eventnotice}</span>`;
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
				icon="mdi:chevron-left"
				@click="${() => this.handleMonthChange(-1)}"
				title=${this.hass.localize('ui.common.previous')}
			>
				<ha-icon icon="mdi:chevron-left"></ha-icon>
			</ha-icon-button>
			<span class="date" style="text-decoration: none; color: ${this._config.calDateColor};">
				${this.selectedMonth.format('MMMM')} ${this.selectedMonth.format('YYYY')}
			</span>
			<ha-icon-button
				class="next"
				style="--mdc-icon-color: ${this._config.calDateColor}"
				icon="mdi:chevron-right"
				@click="${() => this.handleMonthChange(1)}"
				title=${this.hass.localize('ui.common.next')}
			>
				<ha-icon icon="mdi:chevron-right"></ha-icon>
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
		var dayEvents = day.allEvents;

		this.eventSummary = dayEvents.map((event: EventClass) => {
			const eventColor =
				typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this._config.defaultCalColor;
			const finishedEventsStyle =
				event.isFinished && this._config.dimFinishedEvents
					? `opacity: ` + this._config.finishedEventOpacity + `; filter: ` + this._config.finishedEventFilter + `;`
					: ``;

			// is it a full day event? if so then use border instead of bullet else, use a bullet
			if (event.isAllDayEvent) {
				const bulletType: string = typeof event.isDeclined
					? 'summary-fullday-div-declined'
					: 'summary-fullday-div-accepted';

				return html`<div class="${bulletType}" style="border-color:  ${eventColor}; ${finishedEventsStyle}">
					<div aria-hidden="true">
						<div class="bullet-event-span">
							${getCalendarTitleHTML(this._config, event)} ${getCalendarLocationHTML(this._config, event)}
						</div>
						<div class="calMain">
							${this._config.calShowDescription ? getCalendarDescriptionHTML(this._config, event) : ''}
						</div>
					</div>
				</div>`;
			} else {
				const StartTime = this._config.showHours ? event.startDateTime.format('LT') : '';

				const bulletType: string = event.isDeclined ? 'bullet-event-div-declined' : 'bullet-event-div-accepted';

				return html`
					<div class="summary-event-div" style="${finishedEventsStyle}">
						<div class="${bulletType}" style="border-color: ${eventColor}"></div>
						<div class="bullet-event-span" style="color: ${eventColor};">
							${StartTime} - ${getCalendarTitleHTML(this._config, event)}
							${getCalendarLocationHTML(this._config, event)}
						</div>
						<div class="calMain">
							${this._config.calShowDescription ? getCalendarDescriptionHTML(this._config, event) : ''}
						</div>
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
		if (!this._config.showLastCalendarWeek && !dayjs(month[35].date).isSame(this.selectedMonth, 'month'))
			showLastRow = false;

		return month.map((day: CalendarDay, i) => {
			const dayDate = dayjs(day.date);
			const dayStyleOtherMonth = dayDate.isSame(this.selectedMonth, 'month') ? '' : `opacity: .35;`;
			const dayClassToday = dayDate.isSame(dayjs(), 'day') ? `currentDay` : ``;
			const dayStyleSat = dayDate.isoWeekday() == 6 ? `background-color: ${this._config.calEventSatColor};` : ``;
			const dayStyleSun = dayDate.isoWeekday() == 7 ? `background-color: ${this._config.calEventSunColor};` : ``;
			const dayStyleClicked = dayDate.isSame(dayjs(this.clickedDate), 'day')
				? `background-color: ${this._config.calActiveEventBackgroundColor};`
				: ``;

			if (dayDate.isSame(dayjs(), 'day') && !this.clickedDate) {
				this.handleCalendarEventSummary(day, false);
			}
			if (i < 35 || showLastRow)
				return html`
					${i % 7 === 0 ? html`<tr class="cal"></tr>` : ''}
					<td
						@click="${() => this.handleCalendarEventSummary(day, true)}"
						class="cal"
						style="${dayStyleOtherMonth}${dayStyleSat}${dayStyleSun}${dayStyleClicked} --cal-grid-color: ${this._config
							.calGridColor}; --cal-day-color: ${this._config.calDayColor}"
					>
						<div class="calDay ${dayClassToday}">
							<div style="position: relative; top: 5%;">${day.date.date()}</div>
							<div>${handleCalendarIcons(day)}</div>
						</div>
					</td>
					${i && i % 6 === 0 ? html`</tr>` : ''}
				`;
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
		const month = this.month;
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

customElements.define('atomic-calendar-revive', AtomicCalendarRevive);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
	type: 'atomic-calendar-revive',
	name: 'Atomic Calendar Revive',
	preview: true,
	description: localize('common.description'),
});
