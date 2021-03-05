import { LitElement, html, property, TemplateResult } from 'lit-element';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import 'moment/min/locales';
import '@material/mwc-linear-progress';

import moment from 'moment';

import './index-editor';

import { atomicCardConfig } from './types';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';
import defaultConfig from './defaults';

class AtomicCalendarRevive extends LitElement {
	@property() public hass!: HomeAssistant;
	@property() private _config!: atomicCardConfig;
	@property() private content;
	@property() private selectedMonth;

	lastCalendarUpdateTime!: moment.Moment;
	lastEventsUpdateTime!: moment.Moment;
	lastHTMLUpdateTime!: moment.Moment;
	events!: Array<any>;
	shouldUpdateHtml: boolean;
	errorMessage: string;
	modeToggle: string;
	refreshCalEvents: boolean;
	monthToGet: string;
	month: any[];
	showLoader: boolean;
	hiddenEvents: number;
	eventSummary: TemplateResult;
	firstrun: boolean;
	isUpdating: boolean;
	clickedDate!: Date;
	language: string;

	constructor() {
		super();
		this.lastCalendarUpdateTime;
		this.lastEventsUpdateTime;
		this.lastHTMLUpdateTime;
		this.events;
		this.content = html``;
		this.shouldUpdateHtml = true;
		this.errorMessage = '';
		this.modeToggle = '';
		this.selectedMonth = moment();
		this.refreshCalEvents = true;
		this.monthToGet = moment().format('MM');
		this.month = [];
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
			console.info(
				`%c atomic-calendar-revive %c ${localize('common.version')}: ${CARD_VERSION} `,
				'color: white; background: #484848; font-weight: 700;',
				'color: white; background: #cc5500; font-weight: 700;',
			);
		}
		if (!this._config || !this.hass) {
			return html``;
		}
		this.updateCard();

		return html`${this.setStyle()}

			<ha-card class="cal-card">
				${this._config.name || this._config.showDate || (this.showLoader && this._config.showLoader)
				? html` <div class="cal-nameContainer">
							${this._config.name
						? html`<div class="cal-name" @click="${() => this.handleToggle()}">${this._config.name}</div>`
						: ''}
							${this.showLoader && this._config.showLoader ? html`<div class="loader"></div>` : ''}
							${this._config.showDate ? html`<div class="calDate">${this.getDate()}</div>` : ''}
					  </div>`
				: ''}

				<div class="cal-eventContainer" style="padding-top: 4px;">${this.content}</div>
			</ha-card>`;
	}

	async updateCard() {
		this.language =
			typeof this._config.language != 'undefined' ? this._config.language! : this.hass.language.toLowerCase();
		let timeFormat = moment.localeData(this.language).longDateFormat('LT');
		if (this._config.hoursFormat == '12h') timeFormat = 'h:mm A';
		else if (this._config.hoursFormat == '24h') timeFormat = 'H:mm';
		else if (this._config.hoursFormat != 'default') timeFormat = this._config.hoursFormat!;
		moment.updateLocale(this.language, {
			week: {
				dow: this._config.firstDayOfWeek!,
			},
			longDateFormat: {
				LT: timeFormat,
				LTS: 'HH:mm:ss',
				L: 'DD/MM/YYYY',
				LL: 'D MMMM YYYY',
				LLL: 'MMM D YYYY HH:mm',
				LLLL: 'dddd, D MMMM YYYY HH:mm',
			},
		});
		this.firstrun = false;

		// check if an update is needed
		if (!this.isUpdating && this.modeToggle == 'Event') {
			if (
				!this.lastEventsUpdateTime ||
				moment().diff(this.lastEventsUpdateTime, 'seconds') > this._config.refreshInterval
			) {
				this.showLoader = true;
				this.hiddenEvents = 0;
				this.isUpdating = true;
				try {
					this.events = await this.getEvents();
				} catch (error) {
					console.log(error);
					this.errorMessage = localize('errors.update_card');
					this.showLoader = false;
				}

				this.lastEventsUpdateTime = moment();
				this.updateEventsHTML(this.events);
				this.isUpdating = false;
				this.showLoader = false;
			}
		}

		if (this.modeToggle == 'Event') this.updateEventsHTML(this.events);
		else this.updateCalendarHTML();
	}

	handleToggle() {
		if (this._config.enableModeChange) {
			this.modeToggle == 'Event' ? (this.modeToggle = 'Calendar') : (this.modeToggle = 'Event');
			this.requestUpdate();
		}
	}

	getDate() {
		const date = moment().format(this._config.dateFormat);
		return html`${date}`;
	}
	getEventDate() {
		const date = moment().format(this._config.eventDateFormat);
		return html`${date}`;
	}

	setStyle() {
		return html`
			<style>
				.cal-card {
					cursor: default;
					padding: 16px;
				}

				.cal-name {
					font-size: var(--paper-font-headline_-_font-size);
					color: ${this._config.nameColor};
					padding: 4px 8px 12px 0px;
					line-height: 40px;
					cursor: default;
					float: left;
				}

				.cal-nameContainer {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					vertical-align: middle;
					align-items: center;
					margin: 0 8px 0 2px;
				}

				.calDate {
					font-size: var(--paper-font-headline_-_font-size);
					font-size: 1.3rem;
					font-weight: 400;
					color: var(--primary-text-color);
					padding: 4px 8px 12px 0px;
					line-height: 40px;
					cursor: default;
					float: right;
					opacity: 0.75;
				}

				table {
					color: black;
					margin-left: 0px;
					margin-right: 0px;
					border-spacing: 10px 5px;
					border-collapse: collapse;
				}

				td {
					padding: 4px 0 4px 0;
				}

				.daywrap {
					padding: 2px 0 4px 0;
					border-top: 1px solid;
				}

				tr {
					width: 100%;
				}

				.event-left {
					padding: 4px 10px 3px 8px;
					text-align: center;
					vertical-align: top;
				}

				.event-leftCurrentDay {
					width: 40px;
				}

				.daywrap > td {
					padding-top: 8px;
				}

				.event-right {
					display: flex;
					justify-content: space-between;
					padding: 0px 5px 0 5px;
				}

				.event-description {
					display: flex;
					justify-content: space-between;
					padding: 0px 5px 0 5px;
					color: ${this._config.descColor};
					font-size: ${this._config.descSize}%;
				}
				.hidden-events {
					color: var(--primary-text-color);
				}

				.hoursHTML {
					color: ${this._config.timeColor};
					font-size: ${this._config.timeSize}% !important;
					float: left;
				}

				.relativeTime {
					color: ${this._config.timeColor};
					font-size: ${this._config.timeSize}% !important;
					float: right;
					padding-left: 5px;
				}

				.event-main {
					flex-direction: row nowrap;
					display: inline-block;
					vertical-align: top;
				}

				.event-location {
					text-align: right;
					display: inline-block;
					vertical-align: top;
				}

				.event-title {
					font-size: ${this._config.eventTitleSize}%;
				}

				.event-titleRunning {
					font-size: ${this._config.eventTitleSize}%;
				}

				.event-location-icon {
					--mdc-icon-size: 15px;
					color: ${this._config.locationIconColor};
					height: 15px;
					width: 15px;
					margin-top: -2px;
				}

				.location-link {
					text-decoration: none;
					color: ${this._config.locationLinkColor};
					font-size: ${this._config.locationTextSize}%;
				}

				.event-circle {
					width: 10px;
					height: 10px;
					margin-left: -2px;
				}

				hr.event {
					color: ${this._config.eventBarColor};
					margin: -8px 0px 2px 0px;
					border-width: 1px 0 0 0;
				}

				.event-cal-name {
					color: ${this._config.eventCalNameColor};
					font-size: ${this._config.eventCalNameSize}%;
				}
				.event-cal-name-icon {
					--mdc-icon-size: 15px;
				}

				.eventBar {
					margin-top: -10px;
					margin-bottom: 0px;
				}

				.progress-bar {
					--mdc-theme-primary: ${this._config.progressBarColor};
					--mdc-linear-progress-buffer-color: ${this._config.progressBarBufferColor};
				}

				mwc-linear-progress {
					width: 100%;
					margin: auto;
				}

				ha-button-toggle-group {
					color: var(--primary-color);
				}

				.calTitleContainer {
					padding: 0px 8px 8px 8px;
				}

				.calIconSelector {
					--mdc-icon-button-size: var(--button-toggle-size, 48px);
					--mdc-icon-size: var(--button-toggle-icon-size, 24px);
					border-radius: 4px 4px 4px 4px;
					border: 1px solid var(--primary-color);
					float: right;
					display: inline-flex;
					text-align: center;
				}
				.calDateSelector {
					--mdc-icon-button-size: var(--button-toggle-size, 48px);
					--mdc-icon-size: var(--button-toggle-icon-size, 24px);
					display: inline-flex;
					text-align: center;
				}
				div.calIconSelector ha-icon-button,
				div.calDateSelector ha-icon-button {
					color: var(--primary-color);
				}
				div.calDateSelector .prev {
					border: 1px solid var(--primary-color);
					border-radius: 3px 0px 0px 3px;
				}
				div.calDateSelector .date {
					border: 1px solid var(--primary-color);
					border-radius: 0px 0px 0px 0px;
					padding: 4px 2px 2px 4px;
				}
				div.calDateSelector .next {
					border: 1px solid var(--primary-color);
					border-radius: 0px 4px 4px 0px;
				}

				ha-icon-button {
					--mdc-icon-size: 20px;
					--mdc-icon-button-size: 25px;
					color: ${this._config.calDateColor};
				}

				table.cal {
					margin-left: 0px;
					margin-right: 0px;
					border-spacing: 10px 5px;
					border-collapse: collapse;
					width: 100%;
					table-layout: fixed;
				}

				thead th.cal {
					color: var(--secondary-text-color);
					border: 1px solid ${this._config.calGridColor};
					font-size: 11px;
					font-weight: 400;
					text-transform: uppercase;
				}

				td.cal {
					padding: 5px 5px 5px 5px;
					border: 1px solid ${this._config.calGridColor};
					text-align: center;
					vertical-align: middle;
					width: 100%;
					color: ${this._config.calDayColor};
				}

				.calDay {
					height: 38px;
					font-size: 95%;
					max-width: 38px;
					margin: auto;
				}

				.calDay.currentDay {
					height: 20px;
					background-color: var(--primary-color);
					border-radius: 50%;
					display: inline-block;
					text-align: center;
					white-space: nowrap;
					width: max-content;
					min-width: 20px;
					line-height: 140%;
					color: var(--text-primary-color) !important;
				}

				tr.cal {
					width: 100%;
				}

				.calTableContainer {
					width: 100%;
				}

				.summary-event-div {
					padding-top: 3px;
				}

				.bullet-event-div-accepted {
					-webkit-border-radius: 8px;
					border-radius: 8px;
					border: 4px solid;
					height: 0;
					width: 0;
					display: inline-block;
					vertical-align: middle;
				}

				.bullet-event-div-declined {
					-webkit-border-radius: 8px;
					border-radius: 8px;
					border: 1px solid;
					height: 6px;
					width: 6px;
					display: inline-block;
					vertical-align: middle;
				}

				.bullet-event-span {
					overflow: hidden;
					white-space: nowrap;
					display: inline-block;
					vertical-align: middle;
					margin: 0 5px;
					text-decoration: none !important;
				}

				.summary-fullday-div-accepted {
					-webkit-border-radius: 5px;
					border-radius: 5px;
					border: 2px solid;
					border-left: 7px solid;
					padding: 0 4px;
					margin: 5px 0;
					line-height: 16px;
				}

				.summary-fullday-div-declined {
					-webkit-border-radius: 5px;
					border-radius: 5px;
					border: 1px solid;
					padding: 0 4px;
					margin: 5px 0;
					height: 18px;
					line-height: 16px;
				}

				.calDescription {
					display: flex;
					justify-content: space-between;
					padding: 0px 5px 0 5px;
					color: ${this._config.descColor};
					font-size: ${this._config.descSize}%;
				}

				.calMain {
					flex-direction: row nowrap;
					display: inline-block;
					vertical-align: top;
				}

				.calIcon {
					--mdc-icon-size: 10px;
					width: 10px;
					height: 10px;
					padding-top: 0px;
					margin-top: -10px;
					margin-right: -1px;
					margin-left: -1px;
				}

				.eventIcon {
					--mdc-icon-size: 15px !important;
					padding-top: 0px;
					margin-top: -10px;
					margin-right: -1px;
					margin-left: -1px;
				}

				.loader {
					border: 4px solid #f3f3f3;
					border-top: 4px solid grey;
					border-radius: 50%;
					width: 14px;
					height: 14px;
					animation: spin 2s linear infinite;
					float: left;
				}

				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			</style>
		`;
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

	getEventIcon(event) {
		const iconColor: string =
			typeof event._config.color != 'undefined' ? event._config.color : this._config.eventTitleColor;

		if (this._config.showEventIcon && event._config.icon != 'undefined')
			return html`<ha-icon class="eventIcon" style="color: ${iconColor};" icon="${event._config.icon}"></ha-icon>`;
	}
	/**
	 * generate Event Title (summary) HTML
	 *
	 */
	getTitleHTML(event) {
		const titletext: string = event.title;
		const titleColor: string =
			typeof event._config.color != 'undefined' ? event._config.color : this._config.eventTitleColor;
		const dayClassEventRunning = event.isEventRunning ? `event-titleRunning` : `event-title`;

		if (this._config.disableEventLink || event.link == 'undefined' || event.link === null)
			return html`
				<div style="color: ${titleColor}">
					<div class="${dayClassEventRunning}">${this.getEventIcon(event)} ${titletext}</div>
				</div>
			`;
		else
			return html`
				<a href="${event.link}" style="text-decoration: none;" target="${this._config.linkTarget}">
					<div style="color: ${titleColor}">
						<div class="${dayClassEventRunning}">${this.getEventIcon(event)} <span>${titletext}</span></div>
					</div>
				</a>
			`;
	}
	// generate Calendar title
	getCalTitleHTML(event) {
		const titleColor: string =
			typeof event._config.titleColor != 'undefined' ? event._config.titleColor : this._config.eventTitleColor;
		const textDecoration: string =
			typeof event.attendees != 'undefined' &&
				!!event.attendees.find((attendee) => attendee.self == true && attendee.responseStatus == 'declined')
				? 'line-through'
				: 'none';

		if (this._config.disableCalEventLink || event.htmlLink === null) return html`${event.summary}`;
		else
			return html`<a
				href="${event.htmlLink}"
				style="text-decoration: ${textDecoration};color: ${titleColor}"
				target="${this._config.linkTarget}"
				>${event.summary}
			</a>`;
	}
	// generate Calendar description
	getCalDescHTML(event) {
		if (event.description) return html`<div class="calDescription">- ${event.description}</div>`;
	}

	/**
	 * generate Hours HTML
	 *
	 */
	getHoursHTML(event) {
		const today = moment();
		if (event.isEmpty) return html`<div>&nbsp;</div>`;
		// full day events, no hours set
		// 1. Starts any day, ends later -> 'All day, end date'
		if (event.isFullMoreDaysEvent && moment(event.startTime).isAfter(today, 'day'))
			return html`
				${this._config.fullDayEventText}, ${this._config.untilText!.toLowerCase()}
				${this.getCurrDayAndMonth(moment(event.endTime))}
			`;
		// 2 . Is full day event starting before today, ending after today
		else if (
			event.isFullMoreDaysEvent &&
			(moment(event.startTime).isBefore(today, 'day') || moment(event.endTime).isAfter(today, 'day'))
		)
			return html`
				${this._config.fullDayEventText}, ${this._config.untilText!.toLowerCase()}
				${this.getCurrDayAndMonth(moment(event.endTime))}
			`;
		// 3. One day only, or multiple day ends today -> 'All day'
		else if (event.isFullDayEvent) return html`${this._config.fullDayEventText}`;
		// 4. long term event, ends later -> 'until date'
		else if (moment(event.startTime).isBefore(today, 'day') && moment(event.endTime).isAfter(today, 'day'))
			return html`${this._config.untilText} ${this.getCurrDayAndMonth(moment(event.endTime))}`;
		// 5.long term event, ends today -> 'until hour'
		else if (moment(event.startTime).isBefore(today, 'day') && moment(event.endTime).isSame(today, 'day'))
			return html`${this._config.untilText} ${event.endTime.format('LT')}`;
		// 6. starts today or later, ends later -> 'hour - until date'
		else if (!moment(event.startTime).isBefore(today, 'day') && moment(event.endTime).isAfter(event.startTime, 'day'))
			return html`
				${event.startTime.format('LT')}, ${this._config.untilText!.toLowerCase()}
				${this.getCurrDayAndMonth(moment(event.endTime))}
			`;
		// 7. Normal one day event, with time set -> 'hour - hour'
		else return html`${event.startTime.format('LT')} - ${event.endTime.format('LT')}`;
	}

	/**
	 * generate Event Relative Time HTML
	 *
	 */

	getRelativeTime(event) {
		const timeOffset = moment().utcOffset();
		const today = moment().add(timeOffset, 'minutes');
		if (event.isEmpty) return html``;
		else if (!moment(event.startTime).isBefore(today, 'day'))
			return html`(${today.to(moment(event.startTime).add(timeOffset, 'minutes'))})`;
	}

	/**
	 * generate Event Location link HTML
	 *
	 */
	getLocationHTML(event) {
		if (!event.location || !this._config.showLocation) {
			return html``;
		} else if (this._config.disableLocationLink) {
			return html`
				<div><ha-icon class="event-location-icon" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}</div>
			`;
		} else {
			const loc: string = event.location;
			const location: string = loc.startsWith('http') ? loc : 'https://maps.google.com/?q=' + loc;
			return html`
				<div>
					<a href=${location} target="${this._config.linkTarget}" class="location-link">
						<ha-icon class="event-location-icon" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}
					</a>
				</div>
			`;
		}
	}
	getCalLocationHTML(event) {
		if (!event.location || !this._config.showLocation || this._config.disableCalLocationLink) {
			return html``;
		} else {
			const loc: string = event.location;
			const location: string = loc.startsWith('http') ? loc : 'https://maps.google.com/?q=' + loc;
			return html`
				<a href=${location} target="${this._config.linkTarget}" class="location-link">
					<ha-icon class="event-location-icon" icon="mdi:map-marker"></ha-icon>&nbsp;
				</a>
			`;
		}
	}

	/**
	 * update Events main HTML
	 *
	 */
	updateEventsHTML(days) {
		let htmlDays = '';

		// TODO some more tests end error message
		if (!days) {
			this.content = html`${this.errorMessage}`;
			return;
		}

		// TODO write something if no events
		if (days.length === 0 && this._config.maxDaysToShow == 1) {
			this.content = this._config.noEventsForTodayText;
			return;
		} else if (days.length === 0) {
			this.content = this._config.noEventsForNextDaysText;
			return;
		}

		// move today's finished events up
		if (moment(days[0][0]).isSame(moment(), 'day') && days[0].length > 1) {
			let i = 1;
			while (i < days[0].length) {
				if (days[0][i].isEventFinished && !days[0][i - 1].isEventFinished) {
					[days[0][i], days[0][i - 1]] = [days[0][i - 1], days[0][i]];
					if (i > 1) i--;
				} else i++;
			}
		}
		// check if no events for today and push a "no events" fake event
		if (
			this._config.showNoEventsForToday &&
			moment(days[0][0].startTime).isAfter(moment(), 'day') &&
			days[0].length > 0
		) {
			const emptyEv = {
				eventClass: '',
				config: '',
				start: { dateTime: moment().endOf('day') },
				end: { dateTime: moment().endOf('day') },
				summary: this._config.noEventsForTodayText,
				isFinished: false,
				htmlLink: 'https://calendar.google.com/calendar/r/day?sf=true',
			};
			const emptyEvent = new EventClass(emptyEv, this._config, '');
			emptyEvent.isEmpty = true;
			const d: any[] = [];
			d.push(emptyEvent);
			days.unshift(d);
		}
		//loop through days
		htmlDays = days.map((day, di) => {
			//loop through events for each day
			const htmlEvents = day.map((event, i, arr) => {
				const dayWrap = i == 0 && di > 0 ? 'daywrap' : '';
				const isEventNext =
					di == 0 &&
						moment(event.startTime).isAfter(moment()) &&
						(i == 0 || !moment(arr[i - 1].startTime).isAfter(moment()))
						? true
						: false;
				//show line before next event
				const currentEventLine =
					this._config.showCurrentEventLine && isEventNext
						? html`<div class="eventBar">
								<ha-icon icon="mdi:circle" class="event-circle" style="color: ${this._config.eventBarColor};"></ha-icon>
								<hr class="event" />
						  </div>`
						: ``;

				const calColor = typeof event._config.color != 'undefined' ? event._config.color : this._config.defaultCalColor;

				//show calendar name
				const eventCalName = event._config.eventCalName
					? html`<div class="event-cal-name" style="color: ${calColor};">
							<ha-icon icon="mdi:calendar" class="event-cal-name-icon"></ha-icon>&nbsp;${event._config.eventCalName}
					  </div>`
					: ``;

				//show current event progress bar
				let progressBar = html``;
				if (
					di == 0 &&
					((event.isEventRunning && this._config.showFullDayProgress && event.isFullDayEvent) ||
						(event.isEventRunning && !event.isFullDayEvent && this._config.showProgressBar))
				) {
					const eventDuration = event.endTime.diff(event.startTime, 'minutes');
					const eventProgress = moment().diff(event.startTime, 'minutes');
					const eventPercentProgress = (eventProgress * 100) / eventDuration / 100;
					progressBar = html`<mwc-linear-progress
						class="progress-bar"
						determinate
						progress="${eventPercentProgress}"
						buffer="1"
					>
					</mwc-linear-progress>`;
				}

				const finishedEventsStyle =
					event.isEventFinished && this._config.dimFinishedEvents
						? `opacity: ` + this._config.finishedEventOpacity + `; filter: ` + this._config.finishedEventFilter + `;`
						: ``;

				// Show the hours
				const hoursHTML = this._config.showHours ? html`<div class="hoursHTML">${this.getHoursHTML(event)}</div>` : '';

				// Show the relative time
				const relativeTime = this._config.showRelativeTime
					? html`<div class="relativeTime">${this.getRelativeTime(event)}</div>`
					: '';

				// Show the description
				const descHTML = this._config.showDescription
					? html`<div class="event-description">${event.description}</div>`
					: '';
				const lastEventStyle = i == arr.length - 1 ? 'padding-bottom: 8px;' : '';
				// check and set the date format
				const eventDateFormat =
					this._config.europeanDate == true
						? html`${i === 0 ? event.startTimeToShow.format('DD') + ' ' : ''}${i === 0 && this._config.showMonth
							? event.startTimeToShow.format('MMM')
							: ''}`
						: html`${i === 0 && this._config.showMonth ? event.startTimeToShow.format('MMM') + ' ' : ''}${i === 0
							? event.startTimeToShow.format('DD')
							: ''}`;

				const dayClassTodayEvent = moment(event.startTime).isSame(moment(), 'day') ? `event-leftCurrentDay` : ``;

				return html` <tr class="${dayWrap}" style="color: ${this._config.dayWrapperLineColor};">
					<td class="event-left" style="color: ${this._config.dateColor};font-size: ${this._config.dateSize}%;">
						<div class=${dayClassTodayEvent}>
							${i === 0 && this._config.showWeekDay ? event.startTimeToShow.format('ddd') : ''}
						</div>
						<div class=${dayClassTodayEvent}>${eventDateFormat}</div>
					</td>
					<td style="width: 100%; ${finishedEventsStyle} ${lastEventStyle}">
						<div>${currentEventLine}</div>
						<div class="event-right">
							<div class="event-main">${this.getTitleHTML(event)} ${hoursHTML} ${relativeTime}</div>
							<div class="event-location">${this.getLocationHTML(event)} ${eventCalName}</div>
						</div>
						<div class="event-right">
							<div class="event-main">${descHTML}</div>
						</div>
						${progressBar}
					</td>
				</tr>`;
			});

			return htmlEvents;
		});
		const eventnotice = this._config.showHiddenText
			? this.hiddenEvents > 0
				? this.hiddenEvents + ' ' + localize('common.hiddenEventText')
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
	 * ready-to-use function to remove year from moment format('LL')
	 * @param {moment}
	 * @return {String} [month, day]
	 */

	getCurrDayAndMonth(locale) {
		const today = locale.format('LL');
		return today
			.replace(locale.format('YYYY'), '') // remove year
			.replace(/\s\s+/g, ' ') // remove double spaces, if any
			.trim() // remove spaces from the start and the end
			.replace(/[??]\./, '') // remove year letter from RU/UK locales
			.replace(/de$/, '') // remove year prefix from PT
			.replace(/b\.$/, '') // remove year prefix from SE
			.trim() // remove spaces from the start and the end
			.replace(/,$/g, ''); // remove comma from the end
	}

	/**
	 * check if string contains one of keywords
	 * @param {string} string to check inside
	 * @param {string} comma delimited keywords
	 * @return {bool}
	 */
	checkFilter(str, filter) {
		if (typeof filter != 'undefined' && filter != '') {
			const keywords = filter.split(',');
			return keywords.some((keyword) => {
				if (RegExp('(?:^|\\s)' + keyword.trim(), 'i').test(str)) return true;
				else return false;
			});
		} else return false;
	}

	// if event is declined return false
	checkDeclined(event) {
		if (!event.attendees) {
			return false;
		}
		return !!event.attendees.find((attendee) => attendee.self == true && attendee.responseStatus == 'declined');
	}

	// if a time filter is set and entry is between the times, return true
	checkTimeFilter(event, startFilter, endFilter) {
		if (!event.start.dateTime && !event.start.dateTime) {
			return false;
		}
		return (
			moment(event.start.dateTime).isAfter(startFilter, 'hour') &&
			moment(event.start.dateTime).isBefore(endFilter, 'hour')
		);
	}

	/**
	 * gets events from HA to Events mode
	 *
	 */
	async getEvents() {
		const daysToShow = this._config.maxDaysToShow! == 0 ? this._config.maxDaysToShow! : this._config.maxDaysToShow! - 1;
		const timeOffset = -moment().utcOffset();
		const start = moment()
			.add(this._config.startDaysAhead, 'days')
			.startOf('day')
			.add(timeOffset, 'minutes')
			.format('YYYY-MM-DDTHH:mm:ss');
		const end = moment()
			.add(daysToShow + this._config.startDaysAhead!, 'days')
			.endOf('day')
			.add(timeOffset, 'minutes')
			.format('YYYY-MM-DDTHH:mm:ss');
		const calendarUrlList: string[] = [];
		this._config.entities.map((entity) => {
			calendarUrlList.push(`calendars/${entity.entity}?start=${start}Z&end=${end}Z`);
		});
		try {
			return await Promise.all(calendarUrlList.map((url) => this.hass.callApi('GET', url))).then((result) => {
				const singleEvents: any[] = [];
				let eventCount = 0;
				result.map((calendar: any, i: number) => {
					calendar.map((singleEvent) => {
						const blacklist =
							typeof this._config.entities[i]['blacklist'] != 'undefined' ? this._config.entities[i]['blacklist'] : '';
						const whitelist =
							typeof this._config.entities[i]['whitelist'] != 'undefined' ? this._config.entities[i]['whitelist'] : '';
						const singleAPIEvent = new EventClass(singleEvent, this._config, this._config.entities[i]);
						const startTimeFilter =
							typeof this._config.entities[i]['startTimeFilter'] != 'undefined'
								? this._config.entities[i]['startTimeFilter']
								: '';
						const endTimeFilter =
							typeof this._config.entities[i]['endTimeFilter'] != 'undefined'
								? this._config.entities[i]['endTimeFilter']
								: '';
						if (
							(startTimeFilter == '' ||
								endTimeFilter == '' ||
								this.checkTimeFilter(
									singleEvent,
									moment(startTimeFilter, 'HH:mm').subtract(1, 'minute'),
									moment(endTimeFilter, 'HH:mm').add(1, 'minute'),
								)) &&
							(blacklist == '' || !this.checkFilter(singleEvent.summary, blacklist)) &&
							(whitelist == '' || this.checkFilter(singleEvent.summary, whitelist)) &&
							(this._config.showPrivate || singleEvent.visibility != 'private') &&
							(this._config.showDeclined || !this.checkDeclined(singleEvent)) &&
							((this._config.maxDaysToShow === 0 && singleAPIEvent.isEventRunning) ||
								!(this._config.hideFinishedEvents && singleAPIEvent.isEventFinished))
						) {
							singleEvents.push(singleAPIEvent);
							eventCount++;
						}
					});
				});

				if (this._config.sortByStartTime) {
					singleEvents.sort(function (a, b) {
						return moment(a.startTime).diff(moment(b.startTime));
					});
				}

				// Check maxEventCount and softLimit
				if (this._config.maxEventCount) {
					if (
						(!this._config.softLimit && this._config.maxEventCount < singleEvents.length) ||
						(this._config.softLimit && singleEvents.length > this._config.maxEventCount + this._config.softLimit)
					) {
						this.hiddenEvents += singleEvents.length - this._config.maxEventCount;
						singleEvents.length = this._config.maxEventCount;
					}
				}

				const ev: any[] = [].concat(...singleEvents);

				// grouping events by days, returns object with days and events
				const groupsOfEvents = ev.reduce(function (r, a: { daysToSort: number }) {
					r[a.daysToSort] = r[a.daysToSort] || [];
					r[a.daysToSort].push(a);
					return r;
				}, {});

				const days = Object.keys(groupsOfEvents).map(function (k) {
					return groupsOfEvents[k];
				});
				this.showLoader = false;
				return days;
			});
		} catch (error) {
			this.showLoader = false;
			throw error;
		}
	}

	/**
	 * gets events from HA to Calendar mode
	 *
	 */
	getCalendarEvents(startDay, endDay, monthToGet, month) {
		this.refreshCalEvents = false;
		const timeOffset = new Date().getTimezoneOffset();
		const start = moment(startDay).startOf('day').add(timeOffset, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
		const end = moment(endDay).endOf('day').add(timeOffset, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
		// calendarUrlList[url, type of event configured for this callendar,filters]
		const calendarUrlList: any[] = [];
		this._config.entities.map((entity) => {
			if (typeof entity.icon != 'undefined') {
				calendarUrlList.push([
					`calendars/${entity.entity}?start=${start}Z&end=${end}Z`,
					entity.icon,
					typeof entity.blacklist != 'undefined' ? entity.blacklist : '',
					typeof entity.whitelist != 'undefined' ? entity.whitelist : '',
					typeof entity.color != 'undefined' ? entity.color : this._config.defaultCalColor,
					typeof entity.startTimeFilter != 'undefined' ? entity.startTimeFilter : '00:00:00',
					typeof entity.endTimeFilter != 'undefined' ? entity.endTimeFilter : '0:00:00',
				]);
			}
		});
		Promise.all(calendarUrlList.map((url) => this.hass!.callApi('GET', url[0])))
			.then((result: Array<any>) => {
				if (monthToGet == this.monthToGet) {
					result.map((eventsArray, i: number) => {
						this.month.map((m: { date: string }) => {
							const calendarIcon = calendarUrlList[i][1];
							const calendarUrl = calendarUrlList[i][0];
							const calendarBlacklist = typeof calendarUrlList[i][2] != 'undefined' ? calendarUrlList[i][2] : '';
							const calendarWhitelist = typeof calendarUrlList[i][3] != 'undefined' ? calendarUrlList[i][3] : '';
							const calendarColor =
								typeof calendarUrlList[i][4] != 'undefined' ? calendarUrlList[i][4] : this._config.defaultCalColor;
							const filteredEvents = eventsArray.filter((event) => {
								event['startTime'] = event.start.dateTime
									? moment(event.start.dateTime)
									: event.start.date
										? moment(event.start.date).startOf('day')
										: moment(event.start);
								event['endTime'] = event.end.dateTime
									? moment(event.end.dateTime)
									: event.end.date
										? moment(event.end.date).subtract(1, 'days').endOf('day')
										: moment(event.end);

								if (
									!moment(event.startTime).isAfter(m.date, 'day') &&
									!moment(event.endTime).isBefore(m.date, 'day') &&
									calendarIcon &&
									(calendarBlacklist == '' || !this.checkFilter(event.summary, calendarBlacklist)) &&
									(calendarWhitelist == '' || this.checkFilter(event.summary, calendarWhitelist)) &&
									(this._config.showPrivate || event.visibility != 'private') &&
									(this._config.showDeclined || !this.checkDeclined(event))
								) {
									return event;
								}
							});
							// Take filtered events and check if they are full day events or not
							filteredEvents.map((event) => {
								//1. check if google calendar all day event
								if (
									moment(event.startTime).isSame(moment(event.startTime).startOf('day')) &&
									moment(event.endTime).isSame(moment(event.endTime).endOf('day'))
								)
									event['isFullDayEvent'] = true;
								//2. check if CalDav all day event
								else if (
									moment(event.startTime).hours() === 0 &&
									moment(event.startTime).isSame(moment(event.endTime).subtract(1, 'day')) &&
									moment(event.endTime).hours() === 0
								)
									event['isFullDayEvent'] = true;
								else event['isFullDayEvent'] = false;

								// Check if the event is finished
								moment(event.endTime).isBefore(moment())
									? (event['isEventFinished'] = true)
									: (event['isEventFinished'] = false);

								try {
									event['_config'] = {
										color: calendarColor,
										titleColor: this._config.eventTitleColor,
										icon: calendarIcon,
									};
									return m['allEvents'].push(event);
								} catch (e) {
									console.log(localize('common.version') + ': ', e, calendarUrl);
								}
							});
						});
						return month;
					});
				}
				if (monthToGet == this.monthToGet) this.showLoader = false;
				this.refreshCalEvents = false;
				this.requestUpdate();
			})
			.catch((err) => {
				this.refreshCalEvents = false;
				console.log(localize('common.version') + ': ', err);
				this.showLoader = false;
			});
	}

	/**
	 * create array for 42 calendar days
	 * showLastCalendarWeek
	 */
	buildCalendar(selectedMonth) {
		const firstDay = moment(selectedMonth).startOf('month');
		const dayOfWeekNumber = firstDay.day();
		this.month = [];
		let weekShift = 0;
		dayOfWeekNumber - this._config.firstDayOfWeek! >= 0 ? (weekShift = 0) : (weekShift = 7);
		for (
			let i = this._config.firstDayOfWeek! - dayOfWeekNumber - weekShift;
			i < 42 - dayOfWeekNumber + this._config.firstDayOfWeek! - weekShift;
			i++
		) {
			const Calendar = new CalendarDay(moment(firstDay).add(i, 'days'), i);
			this.month.push(Calendar);
		}
	}

	/**
	 * change month in calendar mode
	 *
	 */
	handleMonthChange(i) {
		this.selectedMonth = moment(this.selectedMonth).add(i, 'months');
		this.monthToGet = this.selectedMonth.format('M');
		this.eventSummary = html`&nbsp;`;
		this.refreshCalEvents = true;
	}

	/**
	 * show events summary under the calendar
	 *
	 */
	handleEventSummary(day) {
		this.clickedDate = day.date;
		day._allEvents.sort(function (a, b) {
			const leftStartTime = a.start.dateTime ? moment(a.start.dateTime) : moment(a.start.date).startOf('day');
			const rightStartTime = b.start.dateTime ? moment(b.start.dateTime) : moment(b.start.date).startOf('day');
			return moment(leftStartTime).diff(moment(rightStartTime));
		});
		this.eventSummary = day._allEvents.map((event) => {
			const titleColor =
				typeof event._config.titleColor != 'undefined' ? event._config.titleColor : this._config.eventTitleColor;
			const calColor = typeof event._config.color != 'undefined' ? event._config.color : this._config.defaultCalColor;
			const finishedEventsStyle =
				event.isEventFinished && this._config.dimFinishedEvents
					? `opacity: ` + this._config.finishedEventOpacity + `; filter: ` + this._config.finishedEventFilter + `;`
					: ``;

			// is it a full day event? if so then use border instead of bullet else, use a bullet
			if (event.isFullDayEvent) {
				const bulletType: string =
					typeof event.attendees != 'undefined' &&
						!!event.attendees.find((attendee) => attendee.self == true && attendee.responseStatus == 'declined')
						? 'summary-fullday-div-declined'
						: 'summary-fullday-div-accepted';

				return html`<div class="${bulletType}" style="border-color: ${calColor}; ${finishedEventsStyle}">
					<div aria-hidden="true">
						<div class="bullet-event-span">${this.getCalTitleHTML(event)} ${this.getCalLocationHTML(event)}</div>
						<div class="calMain">${this._config.calShowDescription ? this.getCalDescHTML(event) : ''}</div>
					</div>
				</div>`;
			} else {
				const StartTime = this._config.showHours ? moment(event.startTime).format('LT') : '';

				const bulletType: string =
					typeof event.attendees != 'undefined' &&
						!!event.attendees.find((attendee) => attendee.self == true && attendee.responseStatus == 'declined')
						? 'bullet-event-div-declined'
						: 'bullet-event-div-accepted';

				return html`
					<div class="summary-event-div" style="${finishedEventsStyle}">
						<div class="${bulletType}" style="border-color: ${calColor}"></div>
						<div class="bullet-event-span" style="color: ${titleColor};">
							${StartTime} - ${this.getCalTitleHTML(event)} ${this.getCalLocationHTML(event)}
						</div>
						<div class="calMain">${this._config.calShowDescription ? this.getCalDescHTML(event) : ''}</div>
					</div>
				`;
			}
		});

		this.requestUpdate();
	}

	handleCalendarIcons(day) {
		const allIcons: any[] = [];
		const myIcons: any[] = [];
		day._allEvents.map((event) => {
			if (event._config.icon && event._config.icon.length > 0) {
				const index = myIcons.findIndex((x) => x.icon == event._config.icon);
				if (index === -1) {
					myIcons.push({ icon: event._config.icon, color: event._config.color });
				}
			}
		});

		myIcons.map((icon) => {
			const dayIcon = html`<span>
				<ha-icon class="calIcon" style="color: ${icon.color};" icon="${icon.icon}"></ha-icon>
			</span>`;

			allIcons.push(dayIcon);
		});

		return allIcons;
	}

	/**
	 * create html calendar header
	 *
	 */
	getCalendarHeaderHTML() {
		return html`<div class="calDateSelector">
			<ha-icon-button
				class="prev"
				icon="mdi:chevron-left"
				@click="${() => this.handleMonthChange(-1)}"
				title=${this.hass.localize('ui.common.previous')}
			></ha-icon-button>
			<span class="date" style="text-decoration: none; color: ${this._config.calDateColor};">
				${moment(this.selectedMonth).format('MMMM')} ${moment(this.selectedMonth).format('YYYY')}
			</span>
			<ha-icon-button
				class="next"
				icon="mdi:chevron-right"
				@click="${() => this.handleMonthChange(1)}"
				title=${this.hass.localize('ui.common.next')}
			></ha-icon-button>
		</div>`;
	}

	showCalendarLink() {
		if (!this._config.disableCalLink) {
			return html`<div class="calIconSelector">
				<ha-icon-button
					icon="mdi:calendar"
					onClick="window.open('https://calendar.google.com/calendar/r/month/${moment(this.selectedMonth).format(
				'YYYY',
			)}/${moment(this.selectedMonth).format('MM')}/1'), '${this._config.linkTarget}'"
				>
				</ha-icon-button>
			</div>`;
		}
	}

	/**
	 * create html cells for all days of calendar
	 *
	 */
	getCalendarDaysHTML(month) {
		let showLastRow = true;
		if (!this._config.showLastCalendarWeek && !moment(month[35].date).isSame(this.selectedMonth, 'month'))
			showLastRow = false;

		return month.map((day, i) => {
			const dayStyleOtherMonth = moment(day.date).isSame(moment(this.selectedMonth), 'month') ? '' : `opacity: .35;`;
			const dayClassToday = moment(day.date).isSame(moment(), 'day') ? `currentDay` : ``;
			const dayStyleSat =
				moment(day.date).isoWeekday() == 6 ? `background-color: ${this._config.calEventSatColor};` : ``;
			const dayStyleSun =
				moment(day.date).isoWeekday() == 7 ? `background-color: ${this._config.calEventSunColor};` : ``;
			const dayStyleClicked = moment(day.date).isSame(moment(this.clickedDate), 'day')
				? `background-color: ${this._config.calActiveEventBackgroundColor};`
				: ``;

			if (i < 35 || showLastRow)
				return html`
					${i % 7 === 0 ? html`<tr class="cal"></tr>` : ''}
					<td
						@click="${() => this.handleEventSummary(day)}"
						class="cal"
						style="${dayStyleOtherMonth}${dayStyleSat}${dayStyleSun}${dayStyleClicked}"
					>
						<div class="calDay ${dayClassToday}">
							<div style="position: relative; top: 5%;">${day.dayNumber.replace(/^0|[^/]0./, '')}</div>
							<div>${this.handleCalendarIcons(day)}</div>
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
	updateCalendarHTML() {
		if (
			this.month.length == 0 ||
			this.refreshCalEvents ||
			moment().diff(this.lastCalendarUpdateTime, 'minutes') > 120
		) {
			this.lastCalendarUpdateTime = moment();
			this.showLoader = true;
			this.buildCalendar(this.selectedMonth);
			this.getCalendarEvents(this.month[0].date, this.month[41].date, this.monthToGet, this.month);
			this.showLoader = false;
			this.hiddenEvents = 0;
		}
		const month = this.month;
		const weekDays = moment.weekdaysMin(true);
		const htmlDayNames = weekDays.map(
			(day) => html` <th class="cal" style="color:  ${this._config.calWeekDayColor};">${day}</th> `,
		);
		this.content = html`
			<div class="calTitleContainer">${this.getCalendarHeaderHTML()}${this.showCalendarLink()}</div>
			<div class="calTableContainer">
				<table class="cal" style="color: ${this._config.eventTitleColor};">
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
			<div style="font-size: 90%;">${this.eventSummary}</div>
		`;
	}
}

customElements.define('atomic-calendar-revive', AtomicCalendarRevive);

/**
 * class for 42 calendar days
 *
 */
class CalendarDay {
	calendarDay: moment.Moment;
	_lp: any;
	ymd: string;
	_allEvents: any[];
	_daybackground: string[];
	constructor(calendarDay, d) {
		this.calendarDay = calendarDay;
		this._lp = d;
		this.ymd = moment(calendarDay).format('YYYY-MM-DD');
		this._allEvents = [];
		this._daybackground = [];
	}

	get date() {
		return moment(this.calendarDay);
	}

	get dayNumber() {
		return moment(this.calendarDay).format('DD');
	}

	get monthNumber() {
		return moment(this.calendarDay).month();
	}
	set allEvents(events) {
		this._allEvents = events;
	}

	get allEvents() {
		return this._allEvents;
	}

	set daybackground(eventName) {
		this._daybackground = eventName;
	}

	get daybackground() {
		return this._daybackground;
	}
}

/**
 * class for Events in events mode
 *
 */

class EventClass {
	isEmpty: boolean;
	eventClass: any;
	_globalConfig: any;
	_config: any;
	_startTime: moment.Moment;
	_endTime: moment.Moment;
	isFinished: boolean;
	constructor(eventClass, globalConfig, config) {
		this.eventClass = eventClass;
		this._globalConfig = globalConfig;
		this._config = config;
		this._startTime = this.eventClass.start.dateTime
			? moment(this.eventClass.start.dateTime)
			: this.eventClass.start.date
				? moment(this.eventClass.start.date).startOf('day')
				: moment(this.eventClass.start);
		this._endTime = this.eventClass.end.dateTime
			? moment(this.eventClass.end.dateTime)
			: this.eventClass.end.date
				? moment(this.eventClass.end.date).subtract(1, 'days').endOf('day')
				: moment(this.eventClass.end);
		this.isFinished = false;
		this.isEmpty = false;
	}

	get titleColor() {
		if (this._config.eventTitleColor) return this._config.eventTitleColor;
		else return 'var(--primary-text-color)';
	}

	get title() {
		return this.eventClass.summary;
	}

	get description() {
		return this.eventClass.description;
	}

	//get the start time for an event
	get startTime() {
		if (this._startTime === undefined) {
			const date =
				(this.eventClass.start && this.eventClass.start.date) ||
				this.eventClass.start.startTime ||
				this.eventClass.start ||
				'';
			this._startTime = moment(date);
		}
		return this._startTime.clone();
	}

	//start time, returns today if before today
	get startTimeToShow() {
		const time = this.startTime;
		if (moment(time).isBefore(moment().startOf('day')) && !(this._globalConfig.startDaysAhead < 0))
			return moment().startOf('day');
		else return time;
	}

	//get the end time for an event
	get endTime() {
		if (this._endTime === undefined) {
			const date =
				(this.eventClass.end && this.eventClass.end.date) || this.eventClass.end.endTime || this.eventClass.end || '';
			this._endTime = moment(date);
		}
		return this._endTime.clone();
	}

	get isGoogleCal() {
		if (this.link.includes('google')) return true;
		else return false;
	}

	// is full day event
	get isFullDayEvent() {
		//1. check if google calendar all day event
		if (
			moment(this._startTime).isSame(moment(this._startTime).startOf('day')) &&
			moment(this._endTime).isSame(moment(this._endTime).endOf('day'))
		)
			return true;
		//2. check if CalDav all day event
		else if (
			moment(this._startTime).hours() === 0 &&
			moment(this._startTime).isSame(moment(this._endTime).subtract(1, 'day')) &&
			moment(this._endTime).hours() === 0
		)
			return true;
		else return false;
	}

	// is full day event, more days
	get isFullMoreDaysEvent() {
		if (this.isFullDayEvent)
			if (
				(!this._startTime &&
					!this._endTime &&
					!moment(this._startTime).isSame(moment(this._endTime).subtract(1, 'days'), 'day')) ||
				(moment(this._startTime).isSame(moment(this._startTime).startOf('day')) &&
					moment(this._endTime).isSame(moment(this._endTime).startOf('day')) &&
					moment(this._endTime).subtract(1, 'days').isAfter(moment(this._startTime), 'day'))
			)
				return true;
			else return false;
		else return false;
	}

	// return YYYYMMDD for sorting
	get daysToSort() {
		return moment(this.startTimeToShow).format('YYYYMMDD');
	}

	get isEventRunning() {
		return moment(this.startTime).isBefore(moment()) && moment(this.endTime).isAfter(moment());
	}

	get isEventFinished() {
		return moment(this.endTime).isBefore(moment());
	}

	get location() {
		return this.eventClass.location ? this.eventClass.location.split(' ').join('+') : '';
	}

	get address() {
		return this.eventClass.location ? this.eventClass.location.split(',')[0] : '';
	}

	get link() {
		return this.eventClass.htmlLink;
	}

	get visibility() {
		return this.eventClass.visibility;
	}
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
	type: 'atomic-calendar-revive',
	name: 'Atomic Calendar Revive',
	description: localize('common.description'),
});
