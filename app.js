import {
	LitElement,
	html
} from 'lit-element';
import moment from 'moment';
import 'moment/min/locales';

class AtomicCalendar extends LitElement {
	static get properties() {

		return {
			hass: Object,
			config: Object,
			content: Object,
			selectedMonth: Object
		}
	}

	constructor() {
		super();
		this.lastCalendarUpdateTime;
		this.lastEventsUpdateTime;
		this.lastHTMLUpdateTime;
		this.events;
		this.content = html ``;
		this.shouldUpdateHtml = true;
		this.errorMessage = '';
		this.modeToggle = 0;
		this.selectedMonth = moment();
		this.refreshCalEvents = null;
		this.monthToGet = moment().format("MM");
		this.month = [];
		this.showLoader = false;
		this.eventSummary = html `&nbsp;`;
	}

	updated() {}

	render() {
		moment.updateLocale(this.hass.language, {
			week: {
				dow: this.config.firstDayOfWeek
			}
		});
		if (!this.isUpdating && this.modeToggle == 1) {
			if (!this.lastEventsUpdateTime || moment().diff(this.lastEventsUpdateTime, 'minutes') > 15)
				(async() => {
					this.showLoader = true
					this.isUpdating = true;
					try {
						this.events = await this.getEvents()
					} catch (error) {
						this.errorMessage = 'The calendar can\'t be loaded from Home Assistant component'
					}

					this.lastEventsUpdateTime = moment();
					this.updateEventsHTML(this.events);
					this.isUpdating = false;
				})()
		}

		var t0 = performance.now();
		if (this.modeToggle == 1)
			this.updateEventsHTML(this.events);
		else
			this.updateCalendarHTML();

		return html `
	      ${this.setStyle()}
	  

	  <ha-card class="cal-card">
		<div class="cal-titleContainer">
			<div  class="cal-title"  @click='${e => this.handleToggle(e)}'> 
				${this.config.title}
			</div> 
				${(this.showLoader && this.config.showLoader) ? html`<div style="padding-top: 16px;padding-right: 16px;"><div class="loader" ></div> </div>` : ''}
		</div>
<div style="padding-top: 4px;">
			
				${this.content}
			
		</div>
	  </ha-card>`
	}

	static get styles() {

	}


	handleToggle(e) {
		if (this.config.enableModeChange) {
			this.modeToggle == 1 ? this.modeToggle = 2 : this.modeToggle = 1
			this.requestUpdate()
		}
	}


	setStyle() {
		return html `
		<style>
			.cal-card{
				cursor: default;
				padding: 16px;
			}
			.cal-title {
				font-size: var(--paper-font-headline_-_font-size);
				color: var(--primary-text-color);
				padding: 4px 8px 12px 0px;
				line-height: 40px;
				cursor: default;
				float:left;
				}
			.cal-titleContainer {
				display: flex;
				flex-direction: row;
				justify-content: space-between; 
			}

			
			table{
				color:black;
				margin-left: 0px;
				margin-right: 0px;
				border-spacing: 10px 5px;
				border-collapse: collapse;
			
				
			}

			td {
				padding: 4px 0 4px 0;
				}
			
			.daywrap{
				padding: 2px 0 4px 0;
				border-top: 1px solid; 
				color: ${this.config.dayWrapperLineColor};
				}
				
			tr{
				width: 100%;				 
			}

			.event-left {
				padding: 4px 10px 3px 8px;
				text-align: center;
				color: ${this.config.dateColor};
				font-size: ${this.config.dateSize}%;
				vertical-align: top;
						 
			}
			
			.daywrap > td {
				padding-top: 8px; 
				}
			
			.event-right {
				display: flex;
				justify-content: space-between;
				padding: 0px 5px 0 5px;
			
						 
			}
			
			.event-main {
				flex-direction:row nowrap;
				display: inline-block;
			    vertical-align: top;
		
			}
			
			.event-location {
				text-align: right;
				display: inline-block;
				vertical-align: top;
			}
				
			.event-title {
				font-size: ${this.config.titleSize}%;
				color: ${this.config.titleColor};
				
			}		
			
			.event-time {
				font-size: ${this.config.timeSize}%;
				color: ${this.config.timeColor};
			}			
			
			.event-location-icon {
			    height: 15px;
                width: 15px;
				color: ${this.config.locationIconColor};
				margin-top: -2px;
			}

			.location-link {
				color: ${this.config.locationLinkColor};
				text-decoration: none;
				font-size: ${this.config.locationTextSize}%;
			}

			.event-circle {
				width: 10px;
				height: 10px;
				color: ${this.config.eventBarColor};
				margin-left: -2px
			}

			hr.event {
				color: ${this.config.eventBarColor};
				margin: -8px 0px 2px 0px;
				border-width: 1px 0 0 0;

			}
			
			.eventBar {
				margin-top: -10px; 
				margin-bottom: 0px;
			}
				
			hr.progress {
			color: ${this.config.progressBarColor};
				margin: -8px 0px 2px 0px;
				border-width: 1px 0 0 0;
				border-color: ${this.config.progressBarColor};
			}
				
			.progress-container {
				margin-top: -5px; 
			}	
			
			.progress-circle {
				width: 10px;
				height: 10px;
				color: ${this.config.progressBarColor};
				margin-left: -2px

			}
			
			.progressBar {
				margin-top: -5px; 
				margin-bottom: -2px;
				border-color: ${this.config.progressBarColor};
				
			}
			
			.nextEventIcon{
				width: 10px;
				height: 10px;
				float: left;
				display: block;
				margin-left: -14px;
          	}




			table.cal{
				color:black;
				margin-left: 0px;
				margin-right: 0px;
				border-spacing: 10px 5px;
				border-collapse: collapse;
				width: 100%;
				table-layout:fixed;
				
			}

			td.cal {
				padding: 0 0 0 0;
			
				text-align: center;
				vertical-align: middle;
				width:100%;  
				}		

			.calDay {
				height: 30px;
				font-size: 95%;
				max-width: 38px;
				margin: auto;
			}

			tr.cal {
				width: 100%;		
			}


			paper-icon-button {
				width: 30px;
				height: 30px;
				padding: 4px;
			}

			.calTitleContainer {
				display: flex;
				vertical-align: middle;
				align-items: center;
				justify-content: space-between;
				margin: 0 8px 0 8px;
			}
			
			.calTitle {
	
			}

			.calTableContainer {
				width: 100%;
				}
				
			.calIcon {
				width: 10px;
				height:10px; 
				padding-top: 0px;  
				margin-top: -7px;
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
				float:left;


			}

			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
			
			
		</style>

		`
	}

	setConfig(config) {
		if (!config.entities) {
			throw new Error('You need to define entities');
		}
		this.config = {
			// text translations
			title: 'Calendar', // Card title
			fullDayEventText: 'All day', // "All day" custom text
			untilText: 'Until', // "Until" custom text

			// main settings
			showColors: true, // show calendar title colors, if set in config (each calendar separately)
			maxDaysToShow: 7, // maximum days to show
			showLoader: true, // show animation when loading events from Google calendar

			showLocation: true, // show location link (right side)
			showMonth: false, // show month under day (left side)
			fullTextTime: true, // show advanced time messages, like: All day, until Friday 12
			showCurrentEventLine: false, // show a line between last and next event


			// color and font settings
			dateColor: 'var(--primary-text-color)', // Date text color (left side)
			dateSize: 90, //Date text size (percent of standard text)

			timeColor: 'var(--primary-color)', // Time text color (center bottom)
			timeSize: 90, //Time text size

			titleColor: 'var(--primary-text-color)', //Event title settings (center top), if no custom color set
			titleSize: 100,

			locationIconColor: 'rgb(230, 124, 115)', //Location link settings (right side)
			locationLinkColor: 'var(--primary-text-color)',
			locationTextSize: 90,

			// finished events settings
			dimFinishedEvents: true, // make finished events greyed out or set opacity
			finishedEventOpacity: 0.6, // opacity level
			finishedEventFilter: 'grayscale(100%)', // css filter 

			// days separating
			dayWrapperLineColor: 'var(--primary-text-color)', // days separating line color
			eventBarColor: 'var(--primary-color)',

			showProgressBar: true,
			progressBarColor: 'var(--primary-color)',

			enableModeChange: false,
			defaultMode: 1,

			CalEventBackgroundColor: '#ededed',
			CalEventBackgroundFilter: null,

			CalEventHolidayColor: 'red',
			CalEventHolidayFilter: null,

			CalEventIcon1: 'mdi:gift',
			CalEventIcon1Color: 'var(--primary-text-color)',
			CalEventIcon1Filter: null,


			CalEventIcon2: 'mdi:home',
			CalEventIcon2Color: 'var(--primary-text-color)',
			CalEventIcon2Filter: null,

			CalEventIcon3: 'mdi:star',
			CalEventIcon3Color: 'var(--primary-text-color)',
			CalEventIcon3Filter: null,

			firstDayOfWeek: 1, // default 1 - monday
			...config
		}


		this.modeToggle = this.config.defaultMode

		if (typeof this.config.entities === 'string')
			this.config.entities = [{
				entity: config.entities
			}];
		this.config.entities.forEach((entity, i) => {
			if (typeof entity === 'string')
				this.config.entities[i] = {
					entity: entity
				};
		});
	}

	// The height of your card. Home Assistant uses this to automatically
	// distribute all cards over the available columns.
	getCardSize() {
		return this.config.entities.length + 1;
	}

	_toggle(state) {
		this.hass.callService('homeassistant', 'toggle', {
			entity_id: state.entity_id
		});
	}

	/**
	 * generate Event Title (summary) HTML
	 * 
	 */
	getTitleHTML(event, isEventNext) {
		const titleColor = (this.config.showColors && event.config.color !== "undefined") ? event.config.color : this.config.titleColor
		//const eventIcon = isEventNext ? html`<ha-icon class="nextEventIcon" icon="mdi:arrow-right-bold"></ha-icon>` : ``

		return html `
		<a href="${event.link}" style="text-decoration: none;" target="_blank">
		<div class="event-title" style="color: ${titleColor}">${event.title}</div></a>
		`
	}

	/** 
	 * generate Hours HTML
	 * 
	 */
	getHoursHTML(event) {
		const today = moment()

		// full day events, no hours set
		// 1. One day only, or multiple day ends today -> 'All day'
		if (event.isFullOneDayEvent || (event.isFullMoreDaysEvent && moment(event.endTime).isSame(today, 'day')))
			return html `<div>${this.config.fullDayEventText}</div>`
		// 2. Starts any day, ends later -> 'All day, end date'
		else if (event.isFullMoreDaysEvent)
			return html `<div>${this.config.fullDayEventText}, ${this.config.untilText.toLowerCase()} ${this.getCurrDayAndMonth(moment(event.endTime))}</div>`
		// 3. starts before today, ends after today -> 'date - date'
		else if (event.isFullMoreDaysEvent && (moment(event.startTime).isBefore(today, 'day') || moment(event.endTime).isAfter(today, 'day')))
			return html `<div>${this.config.fullDayEventText}, ${this.config.untilText.toLowerCase()} ${this.getCurrDayAndMonth(moment(event.endTime))}</div>`
		// events with hours set
		//4. long term event, ends later -> 'until date'
		else if (moment(event.startTime).isBefore(today, 'day') && moment(event.endTime).isAfter(today, 'day'))
			return html `<div>${this.config.untilText} ${this.getCurrDayAndMonth(moment(event.endTime))}</div>`
		//5. long term event, ends today -> 'until hour'
		else if (moment(event.startTime).isBefore(today, 'day') && moment(event.endTime).isSame(today, 'day'))
			return html `<div>${this.config.untilText} ${event.endTime.format('LT')}</div>`
		//6. starts today or later, ends later -> 'hour - until date'
		else if (!moment(event.startTime).isBefore(today, 'day') && moment(event.endTime).isAfter(event.startTime, 'day'))
			return html `<div>${event.startTime.format('LT')}, ${this.config.untilText.toLowerCase()} ${this.getCurrDayAndMonth(moment(event.endTime))}</div>`
		// 7. Normal one day event, with time set -> 'hour - hour'
		else return html `
				<div>${event.startTime.format('LT')} - ${event.endTime.format('LT')}</div>`
	}

	/**
	 * generate Event Location link HTML
	 * 
	 */
	getLocationHTML(event) {

		if (!event.location || !this.config.showLocation) return html ``
		else return html `
			<div><a href="https://maps.google.com/?q=${event.location}" target="_blank" class="location-link"><ha-icon class="event-location-icon" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}</a></div>
		`
	}

	/**
	 * update Events main HTML
	 * 
	 */
	updateEventsHTML(days) {
		var htmlDays = ''

		if (!days) { // TODO some more tests end error message
			this.content = html `${this.errorMessage}`
			return
		}

		// TODO write something if no events
		if (days.length == 0) {
			this.content = html `No events in the next days`
			return
		}

		// move today's finished events up
		if (moment(days[0][0]).isSame(moment(), "day") && days[0].length > 1) {
			var i = 1
			while (i < days[0].length) {
				if (days[0][i].isEventFinished && !days[0][i - 1].isEventFinished) {
					[days[0][i], days[0][i - 1]] = [days[0][i - 1], days[0][i]]
					if (i > 1) i--
				} else
					i++
			}
		}


		//loop through days
		htmlDays = days.map((day, di) => {

			//loop through events for each day
			const htmlEvents = day.map((event, i, arr) => {
				const dayWrap = (i == 0 && di > 0) ? 'daywrap' : ''

				const isEventNext = (di == 0 && moment(event.startTime).isAfter(moment()) && (i == 0 || !moment(arr[i - 1].startTime).isAfter(moment()))) ? true : false
				//show line before next event
				const currentEventLine = (this.config.showCurrentEventLine &&
					isEventNext) ? html `<div class="eventBar"><ha-icon icon="mdi:circle" class="event-circle"></ha-icon><hr class="event"/></div>` : ``

				//show current event progress bar
				const progressBar = ``
				if (di == 0 && this.config.showProgressBar && event.isEventRunning) {
					let eventDuration = event.endTime.diff(event.startTime, 'minutes');
					let eventProgress = moment().diff(event.startTime, 'minutes');
					let eventPercentProgress = Math.floor((eventProgress * 100) / eventDuration);
					progressBar = html `<div class="progress-container"><ha-icon icon="mdi:circle" class="progress-circle" 	style="margin-left:${eventPercentProgress}%;"></ha-icon><hr class="progress" /></div>`;

				}

				const finishedEventsStyle = (event.isEventFinished && this.config.dimFinishedEvents) ? `opacity: ` + this.config.finishedEventOpacity + `; filter: ` + this.config.finishedEventFilter : ``

				const lastEventStyle = i == arr.length - 1 ? 'padding-bottom: 8px;' : ''

				return html `
					
					<tr class="${dayWrap}">
						<td class="event-left"><div>
								<div>${(i===0 && this.config.showMonth) ? event.startTimeToShow.format('MMM') : ''}</div>
								<div>${i===0 ? event.startTimeToShow.format('DD') : ''}</div>
								<div>${i===0 ? event.startTimeToShow.format('ddd') : ''}</div>
						</td>
						<td style="width: 100%; ${finishedEventsStyle} ${lastEventStyle} ">
							<div>${currentEventLine}</div>
							<div class="event-right">
								<div class="event-main" >
									${this.getTitleHTML(event,isEventNext)}
									<div class="event-time">${this.getHoursHTML(event)}</div>
								</div>
								<div class="event-location">
									${this.getLocationHTML(event)}
								</div>
							</div>
					${progressBar}
						</td>

					</tr>`
			})

			return htmlEvents
		})
		this.content = html `<table><tbody>${htmlDays}</tbody></table>`
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
			.replace(/[рг]\./, '') // remove year letter from RU/UK locales
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
		const keywords = filter.split(',')
		return (keywords.some((keyword) => {
			if (RegExp('(?:^|\\s)' + keyword.trim(), 'i').test(str))
				return true
			else return false
		}))

	}


	/**
	 * gets events from HA Calendar to Events mode
	 * 
	 */
	async getEvents() {
		let start = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');
		let end = moment().add(this.config.maxDaysToShow, 'days').format('YYYY-MM-DDTHH:mm:ss');
		let calendarUrlList = this.config.entities.map(entity =>
			`calendars/${entity.entity}?start=${start}Z&end=${end}Z`)
		try {
			return await (Promise.all(calendarUrlList.map(url =>
				this.hass.callApi('get', url))).then((result) => {
				let ev = [].concat.apply([], (result.map((singleCalEvents, i) => {
					return singleCalEvents.map(evt => new EventClass(evt, this.config.entities[i]))
				})))

				// sort events
				ev = ev.sort((a, b) => moment(a.startTimeToShow) - moment(b.startTimeToShow))

				// grouping events by days, returns object with days and events
				const groupsOfEvents = ev.reduce(function (r, a) {
					r[a.daysToSort] = r[a.daysToSort] || []
					r[a.daysToSort].push(a);
					return r
				}, {})

				const days = Object.keys(groupsOfEvents).map(function (k) {
					return groupsOfEvents[k];
				});
				this.showLoader = false
				return days
			}))
		} catch (error) {
			this.showLoader = false
			throw error
		}
	}


	/**
	 * gets events from HA to Calendar
	 * 
	 */
	getCalendarEvents(startDay, endDay, monthToGet, month) {
		this.refreshCalEvents = false
		let start = moment(startDay).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
		let end = moment(endDay).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
		// calendarUrlList[url, type of event configured for this callendar,filters]
		let calendarUrlList = []
		this.config.entities.map(entity => {
			if (entity.type) {
				calendarUrlList.push([`calendars/${entity.entity}?start=${start}Z&end=${end}Z`, entity.type])
			}
		})


		Promise.all(calendarUrlList.map(url =>
			this.hass.callApi('get', url[0]))).then((result, i) => {
			if (monthToGet == this.monthToGet)
				result.map((eventsArray, i) => {
					this.month.map(m => {
						const calendarTypes = calendarUrlList[i][1]
						const calendarUrl = calendarUrlList[i][0]
						eventsArray.map((event, i) => {
							const startTime = event.start.dateTime ? moment(event.start.dateTime) : moment(event.start.date).startOf('day')
							const endTime = event.end.dateTime ? moment(event.end.dateTime) : moment(event.end.date).subtract(1, 'days').endOf('day')

							if (!moment(startTime).isAfter(m.date, 'day') && !moment(endTime).isBefore(m.date, 'day') && calendarTypes)
								//checking for calendar type (icons) and keywords
								try {
									if (this.checkFilter('icon1', calendarTypes)) {
										if (!this.config.CalEventIcon1Filter || this.checkFilter(event.summary, this.config.CalEventIcon1Filter))
											m['icon1'].push(event.summary)
									}
									if (this.checkFilter('icon2', calendarTypes)) {
										if (!this.config.CalEventIcon2Filter || this.checkFilter(event.summary, this.config.CalEventIcon2Filter))
											m['icon2'].push(event.summary)
									}
									if (this.checkFilter('icon3', calendarTypes)) {
										if (!this.config.CalEventIcon3Filter || this.checkFilter(event.summary, this.config.CalEventIcon3Filter))
											m['icon3'].push(event.summary)

									}
									if (this.checkFilter('holiday', calendarTypes)) {
										m['holiday'].push(event.summary)
									}
								} catch (e) {
									console.log('error: ', e, calendarUrl)
								}

						})

					})
					return month
				})
			if (monthToGet == this.monthToGet) this.showLoader = false
			this.refreshCalEvents = false
			this.requestUpdate()
		}).catch((err) => {
			this.refreshCalEvents = false
			console.log('error: ', err)
		})


	}


	/**
	 * create array for 42 calendar days
	 * 
	 */
	buildCalendar(selectedMonth) {
		const firstDay = moment(selectedMonth).startOf('month')
		const dayOfWeekNumber = firstDay.day()
		const startDate = moment(firstDay).add(this.config.firstDayOfWeek - dayOfWeekNumber, 'days')
		const endDate = moment(firstDay).add(42 - dayOfWeekNumber + this.config.firstDayOfWeek, 'days')
		this.month = [];
		for (var i = this.config.firstDayOfWeek - dayOfWeekNumber; i < 42 - dayOfWeekNumber + this.config.firstDayOfWeek; i++) {
			this.month.push(new CalendarDay(moment(firstDay).add(i, 'days'), i))
		}
	}

	/**
	 * change month in calendar mode
	 * 
	 */
	handleMonthChange(i) {
		this.selectedMonth = moment(this.selectedMonth).add(i, 'months');
		this.monthToGet = this.selectedMonth.format("M");
		this.eventSummary = html `&nbsp;`;
		this.refreshCalEvents = true
	}

	/**
	 * show events summary under the calendar
	 * 
	 */
	handleEventSummary(day) {
		let events = ([','].concat.apply([], [day.holiday, day.daybackground, day.icon1, day.icon2, day.icon3])).join(', ')
		if (events == '') events = html `&nbsp;`
		this.eventSummary = html `${events}`
		this.requestUpdate()

	}

	/**
	 * create html calendar header
	 * 
	 */
	getCalendarHeaderHTML() {
		return html`
			<div class="calTitle">
				<a href="https://calendar.google.com/calendar/r/month/${moment(this.selectedMonth).format('YYYY')}/${moment(this.selectedMonth).format('MM')}/1" style="text-decoration: none; color: ${this.config.titleColor}" target="_blank">
					${moment(this.selectedMonth).locale(this.hass.language).format('MMMM')}  ${moment(this.selectedMonth).format('YYYY')} 
					</a>	
			</div>
			<div class="calButtons">
				<paper-icon-button icon="mdi:chevron-left" @click='${e => this.handleMonthChange(-1)}' title="left"></paper-icon-button>
				<paper-icon-button icon="mdi:chevron-right" @click='${e => this.handleMonthChange(1)}' title="right"></paper-icon-button>
			</div>`
	}

	/**
	 * create html cells for all days of calendar
	 * 
	 */
	getCalendarDaysHTML(month) {
		return month.map((day, i) => {
			const dayStyleOtherMonth = moment(day.date).isSame(moment(this.selectedMonth), 'month') ? '' : `opacity: .35;`
			const dayStyleToday = moment(day.date).isSame(moment(), 'day') ? `border: 1px solid grey;` : `border: 1px solid grey; border-color: transparent;`
			const dayHolidayStyle = (day.holiday && day.holiday.length > 0) ? `color: ${this.config.CalEventHolidayColor}; ` : ''
			const dayBackgroundStyle = (day.daybackground && day.daybackground.length > 0) ? `background-color: ${this.config.CalEventBackgroundColor}; ` : ''
			const dayIcon1 = (day.icon1 && day.icon1.length > 0) ? html `<span><ha-icon class="calIcon" style="color: ${this.config.CalEventIcon1Color};" icon="${this.config.CalEventIcon1}"></ha-icon></span>` : ''
			const dayIcon2 = (day.icon2 && day.icon2.length > 0) ? html `<span><ha-icon class="calIcon" style="color: ${this.config.CalEventIcon2Color};" icon="${this.config.CalEventIcon2}"></ha-icon></span>` : ''
			const dayIcon3 = (day.icon3 && day.icon3.length > 0) ? html `<span><ha-icon class="calIcon" style="color: ${this.config.CalEventIcon3Color};" icon="${this.config.CalEventIcon3}"></ha-icon></span>` : ''

			return html `		
				${i % 7 === 0 ? html`<tr class="cal">` :''}
					<td class="cal">
							<div @click='${e => this.handleEventSummary(day)}' class="calDay" style="${dayStyleOtherMonth} ${dayStyleToday} ${dayHolidayStyle} ${dayBackgroundStyle}">
								<div style="position: relative; top: 5%; ">
								${(day.dayNumber).replace(/^0|[^\/]0./, '')}
								</div>
								<div>
									${dayIcon1} ${dayIcon2} ${dayIcon3}
								</div>
							</div>
					
					</td>
				${i && (i % 6 === 0) ? html`</tr>` :''}
				`
		})
	}

	/**
	 * update Calendar mode HTML
	 * 
	 */
	updateCalendarHTML() {
		if (this.month.length == 0 || this.refreshCalEvents || moment().diff(this.lastCalendarUpdateTime, 'minutes') > 120) {
			this.lastCalendarUpdateTime = moment()
			this.showLoader = true
			this.buildCalendar(this.selectedMonth)
			this.getCalendarEvents(this.month[0].date, this.month[41].date, this.monthToGet, this.month)
		}

		const month = this.month
		const weekDays = moment.weekdaysMin(true)
		const htmlDayNames = weekDays.map((day) => html `
			<th class="cal" style="padding-bottom: 8px;">${day}</th>`)

		this.content = html `
			<div  class="calTitleContainer">
				${this.getCalendarHeaderHTML()}
			</div>
			<div class="calTableContainer">
				<table class="cal">
					<thead>  <tr>
						${htmlDayNames}
					</tr>  </thead>
					<tbody>
						${this.getCalendarDaysHTML(month)}
					</tbody>
				</table>
			</div>
			<div style="font-size: 90%;">
				${this.eventSummary}
			</div>
			`
	}
}


customElements.define('atomic-calendar', AtomicCalendar);


/**
 * class for 42 calendar days
 * 
 */
class CalendarDay {
	constructor(calendarDay, d) {
		this.calendarDay = calendarDay
		this._lp = d;
		this.ymd = moment(calendarDay).format("YYYY-MM-DD")
		this._holiday = [];
		this._icon1 = [];
		this._icon2 = [];
		this._icon3 = [];
		this._daybackground = [];
	}

	get date() {
		return moment(this.calendarDay)
	}

	get dayNumber() {
		return moment(this.calendarDay).format("DD")
	}

	get monthNumber() {
		return moment(this.calendarDay).month()
	}

	set holiday(eventName) {
		this._holiday = eventName;
	}

	get holiday() {
		return this._holiday;

	}
	set icon1(eventName) {
		this._icon1 = eventName;
	}

	get icon1() {
		return this._icon1;
	}

	set icon2(eventName) {
		this._icon2 = eventName;
	}

	get icon2() {
		return this._icon2;
	}


	set icon3(eventName) {
		this._icon3 = eventName;
	}

	get icon3() {
		return this._icon3;
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
	constructor(eventClass, config) {
		this.eventClass = eventClass;
		this.config = config;
		this._startTime = this.eventClass.start.dateTime ? moment(this.eventClass.start.dateTime) : moment(this.eventClass.start.date).startOf('day')
		this._endTime = this.eventClass.end.dateTime ? moment(this.eventClass.end.dateTime) : moment(this.eventClass.end.date).subtract(1, 'days').endOf('day')
		this.isFinished = false;
	}

	get titleColor() {
		if (this.config.color)
			return this.config.color;
		else return 'var(--primary-text-color)';
	}

	get title() {
		return this.eventClass.summary
	}

	//true start time
	get startTime() {
		return this._startTime
	}

	//start time, returns today if before today
	get startTimeToShow() {
		var time = this.eventClass.start.dateTime ? moment(this.eventClass.start.dateTime) : moment(this.eventClass.start.date).startOf('day')
		if (moment(time).isBefore(moment().startOf('day')))
			return moment().startOf('day')
		else return time
	}

	get endTime() {
		return this._endTime
	}

	// is full day event
	get isFullDayEvent() {
		if (!this.eventClass.start.dateTime && !this.eventClass.end.dateTime)
			return true
		else return false
	}
	// is full day event, but only one day
	get isFullOneDayEvent() {
		if ((!this.eventClass.start.dateTime && !this.eventClass.end.dateTime && moment(this.eventClass.start.date).isSame(moment(this.eventClass.end.date).subtract(1, 'days'), 'day')) || (
				moment(this.eventClass.start.dateTime).isSame(moment(this.eventClass.start.dateTime).startOf('day')) && moment(this.eventClass.end.dateTime).isSame(moment(this.eventClass.end.dateTime).startOf('day')) && moment(this.eventClass.start.dateTime).isSame(moment(this.eventClass.end.dateTime).subtract(1, 'days'), 'day')

			))
			return true
		else return false
	}

	// is full day event, more days
	get isFullMoreDaysEvent() {
		if ((!this.eventClass.start.dateTime && !this.eventClass.end.dateTime && !moment(this.eventClass.start.date).isSame(moment(this.eventClass.end.date).subtract(1, 'days'), 'day')) || (
				moment(this.eventClass.start.dateTime).isSame(moment(this.eventClass.start.dateTime).startOf('day')) && moment(this.eventClass.end.dateTime).isSame(moment(this.eventClass.end.dateTime).startOf('day')) && moment(this.eventClass.end.dateTime).isAfter(moment(this.eventClass.start.dateTime).subtract(1, 'days'), 'day')
			))
			return true
		else return false
	}

	// return YYYYMMDD for sorting
	get daysToSort() {
		return moment(this.startTimeToShow).format('YYYYMMDD');
	}

	get isEventRunning() {
		return (moment(this.startTime).isBefore(moment()) && moment(this.endTime).isAfter(moment()))
	}

	get isEventFinished() {
		return (moment(this.endTime).isBefore(moment()))
	}

	get location() {
		return this.eventClass.location ? (this.eventClass.location).split(' ').join('+') : '';
	}

	get address() {
		return this.eventClass.location ? this.eventClass.location.split(',')[0] : ''
	}

	get link() {
		return this.eventClass.htmlLink
	}
}