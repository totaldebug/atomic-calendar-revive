import { LitElement,html } from 'lit-element';
import moment from 'moment';
import 'moment/min/locales';

class AtomicCalendar extends LitElement {
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
		this.firstrun = true;
		this.language = '';
	}
 
	static get properties() {
		return {
			hass: Object,
			config: Object,
			content: Object,
			selectedMonth: Object
		}
	}
	updated() {}

	render() {
        if(this.firstrun){
			console.info(
				"%c atomic_calendar_revive %c v0.11.2 ",
				"color: white; background: coral; font-weight: 700;",
				"color: coral; background: white; font-weight: 700;"
			);
		}
		this.language = this.config.language != '' ? this.config.language : this.hass.language.toLowerCase()
		let timeFormat = moment.localeData(this.language).longDateFormat('LT')
		if (this.config.hoursFormat=='12h') timeFormat = 'h:mm A'
		else if (this.config.hoursFormat=='24h') timeFormat = 'H:mm'
		else if(this.config.hoursFormat!='default') timeFormat = this.config.hoursFormat
			moment.updateLocale(this.language, {
				week: {
					dow: this.config.firstDayOfWeek
				},
				longDateFormat : {
					LT: timeFormat
				}
			});
		this.firstrun=false

 
 
 
		
		if (!this.isUpdating && this.modeToggle == 1) {
			if (!this.lastEventsUpdateTime || moment().diff(this.lastEventsUpdateTime, 'minutes') > 15)
				(async() => {
					this.showLoader = true
					this.isUpdating = true;
					try {
						this.events = await this.getEvents()
					} catch (error) {
						console.log(error)
						this.errorMessage = 'The calendar can\'t be loaded from Home Assistant component'
						this.showLoader = false
					}

					this.lastEventsUpdateTime = moment();
					this.updateEventsHTML(this.events);
					this.isUpdating = false;
					this.showLoader = false
				})()
		}

		if (this.modeToggle == 1)
			this.updateEventsHTML(this.events);
		else
			this.updateCalendarHTML();

		return html `
	    
	  ${this.setStyle()}

	  <ha-card class="cal-card">
		<div class="cal-titleContainer">
			<div  class="cal-title"  @click='${e => this.handleToggle()}'> 
				${this.config.title}
			</div>
				
				
				${(this.showLoader && this.config.showLoader) ? html`
					<div  class="loader" ></div>` : ''}
		
		
				<div class="calDate">
				${(this.config.showDate) ? this.getDate() : null}
	
			</div>
			
		</div>
<div style="padding-top: 4px;">
			
				${this.content}
			
		</div>
	  </ha-card>`
	}
	
	firstTimeConfig() {
	
		
	}
	

	handleToggle() {
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
			    vertical-align: middle;
				align-items: center;
				margin: 0 8px 0 8px;
			}

		

			.calDate {
			    font-size: var(--paper-font-headline_-_font-size);
				    font-size: 1.3rem;
    font-weight: 400;
				color: var(--primary-text-color);
				padding: 4px 8px 12px 0px;
				line-height: 40px;
				cursor: default;
				float:right;
				    opacity: .75;
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
				}
				
			tr{
				width: 100%;				 
			}

			.event-left {
				padding: 4px 10px 3px 8px;
				text-align: center;
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
			
			.event-description {
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
		
				
			}		
			
			
			.event-location-icon {
			    height: 15px;
                width: 15px;
				margin-top: -2px;
			}

			.location-link {
				text-decoration: none;
			}

			.event-circle {
				width: 10px;
				height: 10px;
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
				margin: -8px 0px 2px 0px;
				border-width: 1px 0 0 0;
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


			.calTableContainer {
				width: 100%;
				}
				
			.calIcon {
				width: 10px;
				height:10px; 
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
				float:left;


			}

			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}

		</style>

		`
	}
	
	getDate() {
		const date=moment().format(this.config.dateFormat)
		return html`${date}`
	}

	setConfig(config) {
		config = JSON.parse(JSON.stringify(config));
		if (!config.entities) {
			throw new Error('You need to define entities');
		}
		this.config = {
			// text translations
			title: 'Calendar', // Card title
			fullDayEventText: 'All day', // "All day" custom text
			untilText: 'Until', // "Until" custom text
			language: '',

			// main settings
			showColors: true, // show calendar title colors, if set in config (each calendar separately)
			maxDaysToShow: 7, // maximum days to show (if zero, show only currently running events)
			maxEventCount: 0, // maximum number of events to show (if zero, unlimited)
			showLoader: true, // show animation when loading events from Google calendar

			showLocation: true, // show location (right side)
			showMonth: false, // show month under day (left side)
			fullTextTime: true, // show advanced time messages, like: All day, until Friday 12
			showCurrentEventLine: false, // show a line between last and next event
			showDate: false,
			dateFormat: 'LL',
			hoursFormat: 'default', // 12h / 24h / default time format. Default is HA language setting.
			startDaysAhead: 0, // shows the events starting on x days from today. Default 0.
			showLastCalendarWeek: true, // always shows last line/week in calendar mode, even if it's not the current month
			showCalNameInEvent: false,
			sortByStartTime: false, // sort first by calendar, then by time
			disableEventLink: false, // disables links to event calendar
			disableLocationLink: false, // disables links to event calendar
			linkTarget: '_blank', // Target for links, can use any HTML target type

			// color and font settings
			dateColor: 'var(--primary-text-color)', // Date text color (left side)
			dateSize: 90, //Date text size (percent of standard text)

			descColor: 'var(--primary-text-color)', // Description text color (left side)
			descSize: 80, //Description text size (percent of standard text)


			showNoEventsForToday: false,
			noEventsForTodayText: 'No events for today',
			noEventsForNextDaysText: 'No events in the next days',

			timeColor: 'var(--primary-color)', // Time text color (center bottom)
			timeSize: 90, //Time text size
			showHours: true, //shows the bottom line (time, duration of event)

			titleColor: 'var(--primary-text-color)', //Event title settings (center top), if no custom color set
			titleSize: 100,

			locationIconColor: 'rgb(230, 124, 115)', //Location link settings (right side)
			locationLinkColor: 'var(--primary-text-color)',
			locationTextSize: 90,

			// finished events settings
			hideFinishedEvents: false, // show finished events
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
			blacklist: null,
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
	getTitleHTML(event) {
		const titletext = (this.config.showCalNameInEvent) ? event.eventClass.organizer.displayName+": " + event.title : event.title
		//var titleColor = this.config.titleColor !='' ? this.config.titleColor : 'var(--primary-text-color)'
		//if (this.config.showColors && typeof event.config.titleColor != 'undefined')  titleColor=event.config.titleColor
		const titleColor = (this.config.showColors && typeof event.config.titleColor != 'undefined') ? event.config.titleColor : this.config.titleColor
		//const eventIcon = isEventNext ? html`<ha-icon class="nextEventIcon" icon="mdi:arrow-right-bold"></ha-icon>` : ``
		if (this.config.disableEventLink || (event.link === null)) return html `
		<div class="event-title" style="font-size: ${this.config.titleSize}%;color: ${titleColor}">${titletext}</div>
		`
		else return html `
		<a href="${event.link}" style="text-decoration: none;" target="${this.config.linkTarget}">
		<div class="event-title" style="font-size: ${this.config.titleSize}%;color: ${titleColor}">${titletext}</div></a>
		`
	}

	/** 
	 * generate Hours HTML
	 * 
	 */
	getHoursHTML(event) {
		const today = moment()
		if(event.isEmpty) return html `<div>&nbsp;</div>`
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
		else if (this.config.disableLocationLink) return html `
		<div><ha-icon class="event-location-icon" style="color:${this.config.locationIconColor};" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}</div>
		`		
		else return html `
			<div><a href="https://maps.google.com/?q=${event.location}" target="${this.config.linkTarget}" class="location-link" style="color: ${this.config.locationLinkColor};font-size: ${this.config.locationTextSize}%;"><ha-icon class="event-location-icon" style="${this.config.locationIconColor}" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}</a></div>
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
			this.content = this.config.noEventsForNextDaysText
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
		
		// check if no events for today and push a "no events" fake event
		if (this.config.showNoEventsForToday && moment(days[0][0].startTime).isAfter(moment(), "day") && days[0].length > 0) {
			var emptyEv = {
				eventClass :'',
				config : '',
				start : { dateTime: moment().endOf('day')},
				end : { dateTime: moment().endOf('day')},
				summary: this.config.noEventsForTodayText,
				isFinished : false,
				htmlLink : 'https://calendar.google.com/calendar/r/day?sf=true'
			};
			var emptyEvent = new EventClass(emptyEv , '')
			emptyEvent.isEmpty = true
			var d = [] 
			d[0]=emptyEvent
			days.unshift(d)
		}
		
		//loop through days
		htmlDays = days.map((day, di) => {

			//loop through events for each day
			const htmlEvents = day.map((event, i, arr) => {
				const dayWrap = (i == 0 && di > 0) ? 'daywrap' : ''
				const isEventNext = (di == 0 && moment(event.startTime).isAfter(moment()) && (i == 0 || !moment(arr[i - 1].startTime).isAfter(moment()))) ? true : false
				//show line before next event
				const currentEventLine = (this.config.showCurrentEventLine &&
					isEventNext) ? html `<div class="eventBar"><ha-icon icon="mdi:circle" class="event-circle" style="color: ${this.config.eventBarColor};"></ha-icon><hr class="event"/></div>` : ``

				//show current event progress bar
				var progressBar = ``
				if (di == 0 && this.config.showProgressBar && event.isEventRunning) {
					let eventDuration = event.endTime.diff(event.startTime, 'minutes');
					let eventProgress = moment().diff(event.startTime, 'minutes');
					let eventPercentProgress = Math.floor((eventProgress * 100) / eventDuration);
					progressBar = html `<div class="progress-container"><ha-icon icon="mdi:circle" class="progress-circle" 	style="margin-left:${eventPercentProgress}%;"></ha-icon><hr class="progress" style="color: ${this.config.progressBarColor};border-color: ${this.config.progressBarColor};" /></div>`;

				}

				var finishedEventsStyle = (event.isEventFinished && this.config.dimFinishedEvents) ? `opacity: ` + this.config.finishedEventOpacity + `; filter: ` + this.config.finishedEventFilter + `;` : ``

				const hoursHTML = this.config.showHours ? html`<div style="color: ${this.config.timeColor}; font-size: ${this.config.timeSize}%;">${this.getHoursHTML(event)}</div>` : ''
				const descHTML = this.config.showDescription ? html`<div class="event-description" style="color: ${this.config.descColor};font-size: ${this.config.descSize}%;">${event.description}</div>` : ''

				const lastEventStyle = i == arr.length - 1 ? 'padding-bottom: 8px;' : ''
				return html `
					
					<tr class="${dayWrap}" style="color: ${this.config.dayWrapperLineColor};">
						<td class="event-left" style="color: ${this.config.dateColor};font-size: ${this.config.dateSize}%;"><div>
								<div>${(i===0 && this.config.showMonth) ? event.startTimeToShow.format('MMM') : ''}</div>
								<div>${i===0 ? event.startTimeToShow.format('DD') : ''}</div>
								<div>${i===0 ? event.startTimeToShow.format('ddd') : ''}</div>
						</td>
						<td style="width: 100%; ${finishedEventsStyle} ${lastEventStyle} ">
							<div>${currentEventLine}</div>
							<div class="event-right">
								<div class="event-main" >
									${this.getTitleHTML(event)}
									${hoursHTML}
								</div>
								<div class="event-location">
									${this.getLocationHTML(event)}
								</div>
							</div>
							${descHTML}
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
		if(typeof filter != 'undefined' && filter!=''){
		const keywords = filter.split(',')
		return (keywords.some((keyword) => {
			if (RegExp('(?:^|\\s)' + keyword.trim(), 'i').test(str))
				return true
			else return false
		}))
	} else return false

	}


	/**
	 * gets events from HA Calendar to Events mode
	 * 
	 */
	async getEvents() {

		let timeOffset = -moment().utcOffset()
		let start = moment().add(this.config.startDaysAhead, 'days').startOf('day').add(timeOffset,'minutes').format('YYYY-MM-DDTHH:mm:ss');
		let endOffset = Math.max(this.config.maxDaysToShow, 1) + this.config.startDaysAhead;
		let end = moment().add(endOffset, 'days').endOf('day').add(timeOffset,'minutes').format('YYYY-MM-DDTHH:mm:ss');
		let calendarUrlList = []
		this.config.entities.map(entity =>{
			calendarUrlList.push([`calendars/${entity.entity}?start=${start}Z&end=${end}Z`])
		})
		try {
			return await (Promise.all(calendarUrlList.map(url =>
				this.hass.callApi('get', url[0]))).then((result) => {
					let singleEvents = []
					let eventCount = 0
					result.map((calendar, i) => {
						calendar.map((singleEvent) => {
							let blacklist = typeof this.config.entities[i]["blacklist"] != 'undefined' ? this.config.entities[i]["blacklist"] : ''
							let singleAPIEvent = new EventClass(singleEvent, this.config.entities[i])
								if((this.config.maxEventCount === 0 || eventCount < this.config.maxEventCount) && (blacklist=='' || !this.checkFilter(singleEvent.summary, blacklist)) && ((this.config.maxDaysToShow === 0 && singleAPIEvent.isEventRunning) || !(this.config.hideFinishedEvents && singleAPIEvent.isEventFinished))){
									singleEvents.push(singleAPIEvent);
									eventCount++;
								}
						})
					})
				
				if (this.config.sortByStartTime) {
					singleEvents.sort(function(a,b) {
						return moment(a.startTime).diff(moment(b.startTime));
					})
				}
				let ev = [].concat.apply([], singleEvents )
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
	 * gets events from HA to Calendar mode
	 * 
	 */
	getCalendarEvents(startDay, endDay, monthToGet, month) {
		this.refreshCalEvents = false
		let timeOffset = new Date().getTimezoneOffset()
		let start = moment(startDay).startOf('day').add(timeOffset,'minutes').format('YYYY-MM-DDTHH:mm:ss');
		let end = moment(endDay).endOf('day').add(timeOffset,'minutes').format('YYYY-MM-DDTHH:mm:ss');
		// calendarUrlList[url, type of event configured for this callendar,filters]
		let calendarUrlList = []
		this.config.entities.map(entity => {
			if (typeof entity.type != 'undefined') {
				calendarUrlList.push([`calendars/${entity.entity}?start=${start}Z&end=${end}Z`, entity.type,
				typeof entity.blacklist!= 'undefined' ? entity.blacklist : ''
				])
			}  
		})

		Promise.all(calendarUrlList.map(url =>
			this.hass.callApi('get', url[0]))).then((result) => {
			if (monthToGet == this.monthToGet)
				result.map((eventsArray, i) => {
					this.month.map(m => {
						const calendarTypes = calendarUrlList[i][1]
						const calendarUrl = calendarUrlList[i][0]
						const calendarBlacklist = (typeof calendarUrlList[i][2] != 'undefined') ? calendarUrlList[i][2] : ''
						eventsArray.map((event) => {
							const startTime = event.start.dateTime ? moment(event.start.dateTime) : moment(event.start.date).startOf('day')
							const endTime = event.end.dateTime ? moment(event.end.dateTime) : moment(event.end.date).subtract(1, 'days').endOf('day')

							if (!moment(startTime).isAfter(m.date, 'day') && !moment(endTime).isBefore(m.date, 'day') && calendarTypes && !this.checkFilter(event.summary, calendarBlacklist))
								//checking for calendar type (icons) and keywords
								try {
									if (this.checkFilter('icon1', calendarTypes)){
										if (!this.config.CalEventIcon1Filter || this.checkFilter(event.summary, this.config.CalEventIcon1Filter))
											m['icon1'].push(event.summary)
									}
									if (this.checkFilter('icon2', calendarTypes)){
										if (!this.config.CalEventIcon2Filter || this.checkFilter(event.summary, this.config.CalEventIcon2Filter))
											m['icon2'].push(event.summary)
									}
									if (this.checkFilter('icon3', calendarTypes)){
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
			this.showLoader = false
		})


	}


	/**
	 * create array for 42 calendar days
	 * showLastCalendarWeek
	 */
	buildCalendar(selectedMonth) {
		const firstDay = moment(selectedMonth).startOf('month')
		const dayOfWeekNumber = firstDay.day()
		this.month = [];
		let weekShift = 0;
		(dayOfWeekNumber - this.config.firstDayOfWeek) >=0 ? weekShift = 0 : weekShift = 7
		for (var i = this.config.firstDayOfWeek - dayOfWeekNumber - weekShift ; i < 42 - dayOfWeekNumber + this.config.firstDayOfWeek -weekShift; i++) {
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
				<paper-icon-button icon="mdi:chevron-left" @click='${e => this.handleMonthChange(-1)}' title="left"></paper-icon-button>
				<div style="display: inline-block; min-width: 9em;  text-align: center;">	
					<a href="https://calendar.google.com/calendar/r/month/${moment(this.selectedMonth).format('YYYY')}/${moment(this.selectedMonth).format('MM')}/1" style="text-decoration: none; color: ${this.config.titleColor}" target="${this.config.linkTarget}">
					${moment(this.selectedMonth).locale(this.language).format('MMMM')}  ${moment(this.selectedMonth).format('YYYY')} 
					</a>
				</div>
				<paper-icon-button icon="mdi:chevron-right" @click='${e => this.handleMonthChange(1)}' title="right"></paper-icon-button>
			</div>
		`
	}

	/**
	 * create html cells for all days of calendar
	 * 
	 */
	getCalendarDaysHTML(month) {
		var showLastRow = true
		if(!this.config.showLastCalendarWeek && !moment(month[35].date).isSame(this.selectedMonth, 'month')) showLastRow = false

		return month.map((day, i) => {
			const dayStyleOtherMonth = moment(day.date).isSame(moment(this.selectedMonth), 'month') ? '' : `opacity: .35;`
			const dayStyleToday = moment(day.date).isSame(moment(), 'day') ? `border: 1px solid grey;` : `border: 1px solid grey; border-color: transparent;`
			const dayHolidayStyle = (day.holiday && day.holiday.length > 0) ? `color: ${this.config.CalEventHolidayColor}; ` : ''
			const dayBackgroundStyle = (day.daybackground && day.daybackground.length > 0) ? `background-color: ${this.config.CalEventBackgroundColor}; ` : ''
			const dayIcon1 = (day.icon1 && day.icon1.length > 0) ? html `<span><ha-icon class="calIcon" style="color: ${this.config.CalEventIcon1Color};" icon="${this.config.CalEventIcon1}"></ha-icon></span>` : ''
			const dayIcon2 = (day.icon2 && day.icon2.length > 0) ? html `<span><ha-icon class="calIcon" style="color: ${this.config.CalEventIcon2Color};" icon="${this.config.CalEventIcon2}"></ha-icon></span>` : ''
			const dayIcon3 = (day.icon3 && day.icon3.length > 0) ? html `<span><ha-icon class="calIcon" style="color: ${this.config.CalEventIcon3Color};" icon="${this.config.CalEventIcon3}"></ha-icon></span>` : ''

			if(i<35 || showLastRow)
			return html `		
				${i % 7 === 0 ? html`<tr class="cal">` :''}
					<td class="cal">
							<div @click='${e => this.handleEventSummary(day)}' class="calDay" style=" color: ${this.config.titleColor}; ${dayStyleOtherMonth} ${dayStyleToday} ${dayHolidayStyle} ${dayBackgroundStyle}">
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
			this.showLoader = false
		}
		const month = this.month
		var weekDays = moment.weekdaysMin(true)
     	const htmlDayNames = weekDays.map((day) => html `
			<th class="cal" style="padding-bottom: 8px; color:  ${this.config.titleColor};">${day}</th>`)

		this.content = html `
			<div  class="calTitleContainer">
				${this.getCalendarHeaderHTML()}
			</div>
			<div class="calTableContainer">
				<table class="cal" style="color: ${this.config.titleColor};">
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
		this.isEmpty = false;
	}

	get titleColor() {
		if (this.config.titleColor)
			return this.config.titleColor;
		else return 'var(--primary-text-color)';
	}

	get title() {
		return this.eventClass.summary
	}

	get description() {
		return this.eventClass.description
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
