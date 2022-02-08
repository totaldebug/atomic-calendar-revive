import { LitElement, html, TemplateResult, CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { formatTime } from './helpers/format-time'
import { getAllEvents, removeDuplicates, checkFilter, groupEventsByDay } from './lib/event.func';
import { styles } from './style';

// DayJS for managing date information
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import relativeTime from 'dayjs/plugin/relativeTime';
import isoWeek from 'dayjs/plugin/isoWeek';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import './locale.dayjs';

dayjs.extend(updateLocale);
dayjs.extend(relativeTime);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(LocalizedFormat);
dayjs.extend(isSameOrBefore);

// Import Card Editor
import './index-editor';

import EventClass from './lib/event.class';

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
  month: any[];
  showLoader: boolean;
  hiddenEvents: number;
  eventSummary: TemplateResult;
  firstrun: boolean;
  isUpdating: boolean;
  clickedDate!: Date;
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
      console.info(
        `%c atomic-calendar-revive %c ${localize('common.version')}: ${CARD_VERSION} `,
        'color: white; background: #484848; font-weight: 700;',
        'color: white; background: #cc5500; font-weight: 700;',
      );
      this.language =
        typeof this._config.language != 'undefined' ? this._config.language! : this.hass.locale ? this.hass.locale.language.toLowerCase() : this.hass.language.toLowerCase();

      dayjs.locale(this.language);

      let timeFormat = typeof this._config.hoursFormat != 'undefined' ? this._config.hoursFormat : (this.hass.locale?.time_format == '12' || this.hass.locale?.time_format == '24') ? formatTime(this.hass.locale) : dayjs().localeData().longDateFormat('LT');
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

      this.selectedMonth = dayjs();
      this.monthToGet = dayjs().format('MM');
    }
    if (!this._config || !this.hass) {
      return html``;
    }
    this.updateCard();

    return html`
			<ha-card class="cal-card" style="--card-height: ${this._config.cardHeight}">
				${this._config.name || this._config.showDate || (this.showLoader && this._config.showLoader)
        ? html` <div class="header">
							${this._config.name
            ? html`<div class="headerName" @click="${() => this.handleToggle()}">${this._config.name}</div>`
            : ''}
							${this.showLoader && this._config.showLoader ? html`<div class="loader"></div>` : ''}
							${this._config.showDate ? html`<div class="headerDate">${this.getDate()}</div>` : ''}
					  </div>`
        : ''}

				<div class="cal-eventContainer" style="padding-top: 4px;">${this.content}</div>
			</ha-card>`;
  }

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
          const { events, failedEvents } = await getAllEvents(this._config, this.hass);
          this.events = events;
          this.failedEvents = failedEvents;
          // Check no event days and display
          if (this._config.showNoEventDays) {
            this.events = this.setNoEventDays(this.events);
          }
          this.events = groupEventsByDay(this.events, this._config);
          console.log(this.events)

        } catch (error) {
          console.log(error);
          this.errorMessage = html`${localize('errors.update_card')}
						<a href="https://docs.totaldebug.uk/atomic-calendar-revive/faq.html" target="${this._config.linkTarget}"
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

    if (this.modeToggle == 'Event') this.updateEventsHTML(this.events);
    else this.updateCalendarHTML();
  }

  setNoEventDays(singleEvents) {
    // Create an array of days to show
    const daysToShow = this._config.maxDaysToShow! == 0 ? this._config.maxDaysToShow! : this._config.maxDaysToShow! - 1;
    let initialTime = dayjs()
      .add(this._config.startDaysAhead!, 'day')
      .startOf('day')
      , endTime = dayjs()
        .add(daysToShow + this._config.startDaysAhead!, 'day')
        .endOf('day')
      , allDates: any = [];
    for (let q = initialTime; q.isBefore(endTime, 'day'); q = q.add(1, 'day')) {
      allDates.push(q);
    }
    allDates.map((day) => {
      var isEvent: boolean = false;

      for (var i = 0; i < singleEvents.length; i++) {
        if (singleEvents[i].startDateTime.isSame(day, 'day')) {
          var isEvent = true;
        }
      }
      if (!isEvent) {
        const emptyEv = {
          eventClass: '',
          config: '',
          start: { dateTime: day.endOf('day') },
          end: { dateTime: day.endOf('day') },
          summary: this._config.noEventText,
          isFinished: false,
          htmlLink: 'https://calendar.google.com/calendar/r/day?sf=true',
        };
        const emptyEvent = new EventClass(emptyEv, this._config);
        emptyEvent.isEmpty = true;
        singleEvents.push(emptyEvent);
        var isEvent = false;

      }
    });
    return singleEvents

  }

  handleToggle() {
    if (this._config.enableModeChange) {
      this.modeToggle == 'Event' ? (this.modeToggle = 'Calendar') : (this.modeToggle = 'Event');
      this.requestUpdate();
    }
  }

  getDate() {
    const date = dayjs().format(this._config.dateFormat);
    return html`${date}`;
  }
  getEventDate() {
    const date = dayjs().format(this._config.eventDateFormat);
    return html`${date}`;
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

  getEventIcon(event: EventClass) {
    const iconColor: string =
      typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this._config.eventTitleColor;

    if (this._config.showEventIcon && event.entityConfig.icon != 'undefined')
      return html`<ha-icon class="eventIcon" style="color:  ${iconColor};" icon="${event.entityConfig.icon}"></ha-icon>`;
  }
  /**
   * generate Event Title (summary) HTML
   * TODO: Add event class
   */
  getTitleHTML(event: EventClass) {
    const titletext: string = event.title;
    const titleColor: string =
      typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this._config.eventTitleColor;
    const dayClassEventRunning = event.isRunning ? `event-titleRunning` : `event-title`;
    const textDecoration: string = event.isDeclined ? 'line-through' : 'none';

    if (this._config.disableEventLink || event.htmlLink == 'undefined' || event.htmlLink === null)
      return html`
				<div style="text-decoration: ${textDecoration};color: ${titleColor}">
					<div class="${dayClassEventRunning}" style="--event-title-size: ${this._config.eventTitleSize}%">${this.getEventIcon(event)} ${titletext}</div>
				</div>
			`;
    else
      return html`
				<a href="${event.htmlLink}" style="text-decoration: ${textDecoration};" target="${this._config.linkTarget}">
					<div style="color: ${titleColor}">
						<div class="${dayClassEventRunning}" style="--event-title-size: ${this._config.eventTitleSize}%">${this.getEventIcon(event)} <span>${titletext}</span></div>
					</div>
				</a>
			`;
  }
  // generate Calendar title
  getCalTitleHTML(event) {
    const titleColor: string =
      typeof event._config.titleColor != 'undefined' ? event._config.titleColor : this._config.eventTitleColor;
    const textDecoration: string = event.isDeclined ? 'line-through' : 'none';

    if (this._config.disableCalEventLink || event.htmlLink === null)
      return html`<span
				style="text-decoration: ${textDecoration};color: ${titleColor}"
				>${event.summary}
			</span>`;
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
    if (event.description) {
      var desc = event.description
      if (this._config.descLength && event.description.length > this._config.descLength) {
        var desc = event.description.slice(0, this._config.descLength)
      }
      return html`<div class="calDescription" style="--description-color: ${this._config.descColor}; --description-size: ${this._config.descSize}%">- ${desc}</div>`;
    }
  }

  /**
   * generate Hours HTML
   *
   */
  getHoursHTML(event: EventClass) {
    const today = dayjs();
    if (event.isEmpty) return html`<div>&nbsp;</div>`;
    // full day events, no hours set
    // 1. Starts any day, ends later -> 'All day, end date'
    if (event.isMultiDay && event.startDateTime.isAfter(today, 'day'))
      return html`
				${this._config.fullDayEventText}, ${this._config.untilText!.toLowerCase()}
				${this.getCurrDayAndMonth(event.endDateTime)}
			`;
    // 2 . Is full day event starting before today, ending after today
    else if (
      event.isMultiDay &&
      (event.startDateTime.isBefore(today, 'day') || event.endDateTime.isAfter(today, 'day'))
    )
      return html`
				${this._config.fullDayEventText}, ${this._config.untilText!.toLowerCase()}
				${this.getCurrDayAndMonth(event.endDateTime)}
			`;
    // 3. One day only, or multiple day ends today -> 'All day'
    else if (event.isAllDayEvent) return html`${this._config.fullDayEventText}`;
    // 4. long term event, ends later -> 'until date'
    else if (event.startDateTime.isBefore(today, 'day') && event.endDateTime.isAfter(today, 'day'))
      return html`${this._config.untilText} ${this.getCurrDayAndMonth(event.endDateTime)}`;
    // 5.long term event, ends today -> 'until hour'
    else if (event.startTimeToShow.isBefore(today, 'day') && event.endDateTime.isSame(today, 'day'))
      return html`${this._config.untilText} ${event.endDateTime.format('LT')}`;
    // 6. starts today or later, ends later -> 'hour - until date'
    else if (!event.startDateTime.isBefore(today, 'day') && event.endDateTime.isAfter(event.startDateTime, 'day'))
      return html`
				${event.startDateTime.format('LT')}, ${this._config.untilText!.toLowerCase()}
				${this.getCurrDayAndMonth(event.endDateTime)}
			`;
    // 7. Normal one day event, with time set -> 'hour - hour'
    else return html`${event.startDateTime.format('LT')} - ${event.endDateTime.format('LT')}`;
  }

  /**
   * generate Event Relative Time HTML
   *
   */

  getRelativeTime(event: EventClass) {
    const timeOffset = dayjs().utcOffset();
    const today = dayjs().add(timeOffset, 'minutes');
    if (event.isEmpty) return html``;
    else if (!event.startDateTime.isBefore(today, 'day'))
      return html`(${today.to(event.startDateTime.add(timeOffset, 'minutes'))})`;
  }

  /**
   * generate Event Location link HTML
   *
   */
  getLocationHTML(event: EventClass) {
    if (!event.location || !this._config.showLocation) {
      return html``;
    } else if (this._config.disableLocationLink) {
      return html`
				<div><ha-icon class="event-location-icon" style="--location-icon-color: ${this._config.locationIconColor}" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}</div>
			`;
    } else {
      const loc: string = event.location;
      const location: string = loc.startsWith('http') ? loc : 'https://maps.google.com/?q=' + loc;
      return html`
				<div>
					<a href=${location} target="${this._config.linkTarget}" class="location-link" style="--location-link-size: ${this._config.locationTextSize}%">
						<ha-icon class="event-location-icon" style="--location-icon-color: ${this._config.locationIconColor}" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}
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
				<a href=${location} target="${this._config.linkTarget}" class="location-link" style="--location-link-size: ${this._config.locationTextSize}%">
					<ha-icon class="event-location-icon" style="--location-icon-color: ${this._config.locationIconColor}" icon="mdi:map-marker"></ha-icon>&nbsp;
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
      this.content = this.errorMessage;
      return;
    }

    // TODO write something if no events
    if (days.length === 0 && this._config.maxDaysToShow == 1) {
      this.content = this._config.noEventText;
      return;
    } else if (days.length === 0) {
      this.content = this._config.noEventsForNextDaysText;
      return;
    }

    // move today's finished events up
    if (dayjs(days[0][0]).isSame(dayjs(), 'day') && days[0].length > 1) {
      let i = 1;
      while (i < days[0].length) {
        if (days[0][i].isEventFinished && !days[0][i - 1].isEventFinished) {
          [days[0][i], days[0][i - 1]] = [days[0][i - 1], days[0][i]];
          if (i > 1) i--;
        } else i++;
      }
    }
    // check if no events for today and push a "no events" fake event
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

    //loop through days
    htmlDays = days.map((day, di) => {

      var dayEvents = day

      //loop through events for each day
      // TODO: Add type to event
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
								<hr class="event" style="--event-bar-color: ${this._config.eventBarColor} "/>
						  </div>`
            : ``;

        const calColor = typeof event.entityConfig.color != 'undefined' ? event.entityConfig.color : this._config.defaultCalColor;

        //show calendar name
        const eventCalName = event.entityConfig.calendarName
          ? html`<div class="event-cal-name" style="color: ${calColor};">
							<ha-icon icon="mdi:calendar" class="event-cal-name-icon"></ha-icon>&nbsp;${event.entityConfig.calendarName}
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
          progressBar = html`<mwc-linear-progress
						class="progress-bar"
            style="--mdc-theme-primary: ${this._config.progressBarColor}; --mdc-linear-progress-buffer-color: ${this._config.progressBarBufferColor};
						determinate
						progress="${eventPercentProgress}"
						buffer="1"
					>
					</mwc-linear-progress>`;
        }

        const finishedEventsStyle =
          !event.isFinished && this._config.dimFinishedEvents
            ? `opacity: ` + this._config.finishedEventOpacity + `; filter: ` + this._config.finishedEventFilter + `;`
            : ``;

        // Show the hours
        const hoursHTML = this._config.showHours ? html`<div class="hoursHTML" style="--time-color: ${this._config.timeColor}; --time-size: ${this._config.timeSize}%">${this.getHoursHTML(event)}</div>` : '';

        // Show the relative time
        const relativeTime = this._config.showRelativeTime
          ? html`<div class="relativeTime" style="--time-color: ${this._config.timeColor}; --time-size: ${this._config.timeSize}%">${this.getRelativeTime(event)}</div>`
          : '';

        // Show the description
        const descHTML = this._config.showDescription ?
          event.description && this._config.descLength && event.description.length >= this._config.descLength ?
            html`<div class="event-description" style="--description-color: ${this._config.descColor}; --description-size: ${this._config.descSize}%">${event.description.slice(0, this._config.descLength)}</div>`
            : html`<div class="event-description" style="--description-color: ${this._config.descColor}; --description-size: ${this._config.descSize}%">${event.description}</div>`
          : '';

        const lastEventStyle = i == arr.length - 1 ? 'padding-bottom: 8px;' : '';
        // check and set the date format
        const eventDateFormat =
          this._config.europeanDate == true
            ? html`${i === 0 ? event.startTimeToShow.format('DD') + ' ' : ''
              }${i === 0 && this._config.showMonth
                ? event.startTimeToShow.format('MMM')
                : ''}`
            : html`${i === 0 && this._config.showMonth ? event.startTimeToShow.format('MMM') + ' ' : ''}${i === 0
              ? event.startTimeToShow.format('DD')
              : ''
              }`;

        const dayClassTodayEvent = event.startDateTime.isSame(dayjs(), 'day') ? `event-leftCurrentDay` : ``;

        return html`<tr class="${dayWrap}" style="color:  ${this._config.dayWrapperLineColor};">
	<td class="event-left" style="color: ${this._config.dateColor};font-size: ${this._config.dateSize}%;">
		<div class=${dayClassTodayEvent}>
			${i === 0 && this._config.showWeekDay ? event.startTimeToShow.format('ddd') : ''}
</div>
	<div class=${dayClassTodayEvent}>${eventDateFormat}</div>
		</td>
		<td style="width: 100%;  ${finishedEventsStyle} ${lastEventStyle}">
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
   * gets events from HA to Calendar mode
   *
   */
  getCalendarEvents(startDay, endDay, monthToGet, month) {
    this.refreshCalEvents = false;
    const timeOffset = dayjs().utcOffset();
    const start = dayjs(startDay).startOf('day').add(timeOffset, 'minutes').format('YYYY-MM-DDTHH:mm:ss');
    const end = dayjs(endDay).endOf('day').add(timeOffset, 'minutes').format('YYYY-MM-DDTHH:mm:ss');

    // calendarUrlList[url, type of event configured for this callendar,filters]
    const calendarUrlList: any[] = [];
    this._config.entities.map((entity) => {
      // Check for calendar settings, if any are undefined, set defaults
      calendarUrlList.push([
        `calendars/${entity.entity}?start=${start}Z&end=${end}Z`,
        typeof entity.icon != 'undefined' ? entity.icon : 'mdi:bell-circle',
        typeof entity.blacklist != 'undefined' ? entity.blacklist : '',
        typeof entity.whitelist != 'undefined' ? entity.whitelist : '',
        typeof entity.locationWhitelist != 'undefined' ? entity.locationWhitelist : '',
        typeof entity.color != 'undefined' ? entity.color : this._config.defaultCalColor,
        typeof entity.startTimeFilter != 'undefined' ? entity.startTimeFilter : '00:00:00',
        typeof entity.endTimeFilter != 'undefined' ? entity.endTimeFilter : '00:00:00',
      ]);
    });
    Promise.all(calendarUrlList.map((url) => this.hass!.callApi('GET', url[0])))
      .then((result: Array<any>) => {
        if (monthToGet == this.monthToGet) {
          result.map((eventsArray, i: number) => {
            this.month.map((m: CalendarDay) => {
              const calendarUrl = calendarUrlList[i][0];
              const calendarIcon = calendarUrlList[i][1];
              const calendarBlacklist = typeof calendarUrlList[i][2] != 'undefined' ? calendarUrlList[i][2] : '';
              const calendarWhitelist = typeof calendarUrlList[i][3] != 'undefined' ? calendarUrlList[i][3] : '';
              const calendarLocationWhitelist = typeof calendarUrlList[i][4] != 'undefined' ? calendarUrlList[i][4] : '';
              const calendarColor =
                typeof calendarUrlList[i][5] != 'undefined' ? calendarUrlList[i][5] : this._config.defaultCalColor;

              eventsArray.map((event: EventClass) => {
                console.log(event)
                console.log(m.date)
                console.log(event.startDateTime.isAfter(m.date, 'day'));
                if (
                  !event.startDateTime.isAfter(m.date, 'day') &&
                  !event.endDateTime.isBefore(m.date, 'day') &&
                  calendarIcon &&
                  (calendarBlacklist == '' || !checkFilter(event.title, calendarBlacklist)) &&
                  (calendarWhitelist == '' || checkFilter(event.title, calendarWhitelist)) &&
                  (calendarLocationWhitelist == '' || checkFilter(event.location, calendarLocationWhitelist)) &&
                  (this._config.showPrivate || event.visibility != 'private') &&
                  (this._config.showDeclined || event.isDeclined)
                ) {
                  // Check if google calendar  or CalDav all day event
                  if (
                    (event.startDateTime.isSame(event.startDateTime.startOf('day')) &&
                      event.endDateTime.isSame(event.endDateTime.endOf('day'))) ||
                    (event.startDateTime.hour() == 0 &&
                      event.endDateTime.hour() == 0 &&
                      event.startDateTime.isSameOrBefore(event.endDateTime, 'day'))
                  ) {
                    event['isFullDayEvent'] = true;
                  } else {
                    event['isFullDayEvent'] = false;
                  }

                  // Check if the event is finished
                  event.endDateTime.isBefore(dayjs())
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
    const firstDay = dayjs(selectedMonth).startOf('month');
    const dayOfWeekNumber = firstDay.day();
    this.month = [];
    let weekShift = 0;
    dayOfWeekNumber - this._config.firstDayOfWeek! >= 0 ? (weekShift = 0) : (weekShift = 7);
    for (
      let i = this._config.firstDayOfWeek! - dayOfWeekNumber - weekShift;
      i < 42 - dayOfWeekNumber + this._config.firstDayOfWeek! - weekShift;
      i++
    ) {
      const Calendar = new CalendarDay(firstDay.add(i, 'day'), i);
      this.month.push(Calendar);
    }
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
   * show events summary under the calendar
   *
   */
  handleEventSummary(day, fromClick) {
    if (fromClick) {
      this.clickedDate = day.date;
    }

    var dayEvents = day._allEvents;

    this.eventSummary = dayEvents.map((event: EventClass) => {
      // TODO: Revert back to config color
      const titleColor =
        typeof event.titleColor != 'undefined' ? event.titleColor : this._config.eventTitleColor;
      const calColor = typeof event.titleColor != 'undefined' ? event.titleColor : this._config.defaultCalColor;
      const finishedEventsStyle =
        !event.isRunning && this._config.dimFinishedEvents
          ? `opacity: ` + this._config.finishedEventOpacity + `; filter: ` + this._config.finishedEventFilter + `;`
          : ``;

      // is it a full day event? if so then use border instead of bullet else, use a bullet
      if (event.isAllDayEvent) {
        const bulletType: string =
          typeof event.isDeclined
            ? 'summary-fullday-div-declined'
            : 'summary-fullday-div-accepted';

        return html`<div class="${bulletType}" style="border-color:  ${calColor}; ${finishedEventsStyle}">
					<div aria-hidden="true">
						<div class="bullet-event-span">${this.getCalTitleHTML(event)} ${this.getCalLocationHTML(event)}</div>
						<div class="calMain">${this._config.calShowDescription ? this.getCalDescHTML(event) : ''}</div>
					</div>
				</div>`;
      } else {
        const StartTime = this._config.showHours ? event.startDateTime.format('LT') : '';

        const bulletType: string =
          event.isDeclined
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
    day._allEvents.map((event: EventClass) => {
      if (event.entityConfig.icon && event.entityConfig.icon.length > 0) {
        const index = myIcons.findIndex((x) => x.icon == event.entityConfig.icon && x.color == event.entityConfig.color);
        if (index === -1) {
          myIcons.push({ icon: event.entityConfig.icon, color: event.entityConfig.color });
        }
      }
    });

    myIcons.map((icon) => {
      const dayIcon = html`<span>
				<ha-icon class="calIcon" style="color:  ${icon.color};" icon="${icon.icon}"></ha-icon>
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

  showCalendarLink() {
    if (!this._config.disableCalLink) {
      return html`<div class="calIconSelector">
				<ha-icon-button
					icon="mdi:calendar"
          style="--mdc-icon-color: ${this._config.calDateColor}"
					onClick="window.open('https://calendar.google.com/calendar/r/month/${this.selectedMonth.format('YYYY')}/${this.selectedMonth.format('MM')}/1'), '${this._config.linkTarget}'"
				>
					<ha-icon icon="mdi:calendar"></ha-icon>
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
    if (!this._config.showLastCalendarWeek && !dayjs(month[35].date).isSame(this.selectedMonth, 'month'))
      showLastRow = false;

    return month.map((day, i) => {
      const dayDate = dayjs(day.date);
      const dayStyleOtherMonth = dayDate.isSame(this.selectedMonth, 'month') ? '' : `opacity: .35;`;
      const dayClassToday = dayDate.isSame(dayjs(), 'day') ? `currentDay` : ``;
      const dayStyleSat = dayDate.isoWeekday() == 6 ? `background-color: ${this._config.calEventSatColor};` : ``;
      const dayStyleSun = dayDate.isoWeekday() == 7 ? `background-color: ${this._config.calEventSunColor};` : ``;
      const dayStyleClicked = dayDate.isSame(dayjs(this.clickedDate), 'day')
        ? `background-color: ${this._config.calActiveEventBackgroundColor};`
        : ``;
      if (dayDate.isSame(dayjs(), 'day') && !this.clickedDate) {
        this.handleEventSummary(day, false)
      }
      if (i < 35 || showLastRow)
        return html`
					${i % 7 === 0 ? html`<tr class="cal"></tr>` : ''}
					<td
						@click="${() => this.handleEventSummary(day, true)}"
						class="cal"
						style="${dayStyleOtherMonth}${dayStyleSat}${dayStyleSun}${dayStyleClicked} --cal-grid-color: ${this._config.calGridColor}; --cal-day-color: ${this._config.calDayColor}"
					>
						<div class="calDay ${dayClassToday}">
							<div style="position: relative; top: 5%;">${day.date.date()}</div>
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
      !this.lastCalendarUpdateTime ||
      dayjs().diff(dayjs(this.lastCalendarUpdateTime), 'second') > this._config.refreshInterval
    ) {
      this.lastCalendarUpdateTime = dayjs();
      this.showLoader = true;
      this.buildCalendar(this.selectedMonth);
      this.getCalendarEvents(this.month[0].date, this.month[41].date, this.monthToGet, this.month);
      this.showLoader = false;
      this.hiddenEvents = 0;
    }
    const month = this.month;
    const weekDays = dayjs.weekdaysMin(true);
    const htmlDayNames = weekDays.map(
      (day) => html`<th class="cal" style="color:  ${this._config.calWeekDayColor};">${day}</th>`,
    );
    this.content = html`
			<div class="calTitleContainer">${this.getCalendarHeaderHTML()}${this.showCalendarLink()}</div>
			<div class="calTableContainer">
				<table class="cal" style="color: ${this._config.eventTitleColor};--cal-border-color:${this._config.calGridColor}">
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

/**
 * class for 42 calendar days
 *
 */
class CalendarDay {
  calendarDay: dayjs.Dayjs;
  _lp: any;
  ymd: string;
  _allEvents: any[];
  _daybackground: string[];
  constructor(calendarDay, d) {
    this.calendarDay = calendarDay;
    this._lp = d;
    this.ymd = dayjs(calendarDay).format('YYYY-MM-DD');
    this._allEvents = [];
    this._daybackground = [];
  }

  get date() {
    return dayjs(this.calendarDay);
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



(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'atomic-calendar-revive',
  name: 'Atomic Calendar Revive',
  preview: true,
  description: localize('common.description'),
});
