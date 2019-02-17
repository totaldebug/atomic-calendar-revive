import { LitElement, css } from 'lit-element';
import { html } from 'lit-html';
import moment from 'moment';
import 'moment/min/locales';



class AtomicCalendar extends LitElement {
  static get properties() {

    return {
		hass: Object,
		config: Object,
		content: Object,
    }
  }

	constructor() {
		super();
		this.lastCalendarUpdateTime;
		this.lastHTMLUpdateTime;
		this.events;
		this.content=html``;
		this.shouldUpdateHtml = false;
	}
  
  updated(){
   
  }  
  
render() {

	if(!this.isUpdating){
		(async () => {
			this.isUpdating=true;


			
			// get events from HA Calendar each 15 minutes
			if (!this.lastCalendarUpdateTime || moment().diff(this.lastCalendarUpdateTime,'minutes') > 15) {
				moment.locale(this.hass.language);
				this.events = await this.getEvents()
				this.lastCalendarUpdateTime = moment();
				this.shouldUpdateHtml = true;
				}

			// update HTML each 1 minute, or after calendar reload
			if (this.shouldUpdateHtml || !this.lastHTMLUpdateTime || moment().diff(this.lastHTMLUpdateTime,'minutes') > 1) {
				moment.locale(this.hass.language);
				this.updateHTML(this.events);
				this.shouldUpdateHtml = false;
				this.lastHTMLUpdateTime = moment();
				}

		this.isUpdating=false;
		})()
	}
	return html`
	      ${this.setStyle()}
	  

	  <ha-card class="cal-card">
		<div class="cal-title" >
			${this.config.title}
		</div>
		<div style="padding-top: 4px;">
			<table><tbody>
				${this.content}
			</tbody></table>
		</div>
	  </ha-card>`

  }

  static get styles() {
        return [css`
		
		
		
		
		`];
      }

  setStyle(){
	return html`
		<style>
			.cal-card{
		
				padding: 16px;
			}
			.cal-title {
				font-size: var(--paper-font-headline_-_font-size);
				color: var(--primary-text-color);
				padding: 4px 8px 12px 0px;
				line-height: 40px;
				
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
			
			.event-right {
				display: flex;
				justify-content: space-between;
				padding: 0px 5px 4px 5px;
			
						 
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
				width: 12px;
				height: 12px;
				color: ${this.config.eventBarColor};
				margin-left: -2px
			}

			hr.event {
				color: ${this.config.eventBarColor};
				margin: -8px 0px 2px 0px;
				border-width: 1px 0 0 0;

			}
			
			.eventBar {
				margin-top: -5px; 
				margin-bottom: -2px;
			}
				
			hr.progress {
			color: ${this.config.progressBarColor};
				margin: -8px 0px 2px 0px;
				border-width: 1px 0 0 0;
			}
				
			.progress-container {
				margin-top: -7px; 
				margin-bottom: 7px;
				
			}	
			.progress-circle {
				width: 12px;
				height: 12px;
				color: ${this.config.progressBarColor};
				margin-left: -2px

			}
			
			.progressBar {
				margin-top: -5px; 
				margin-bottom: -2px;
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
		showColors: true,  // show calendar title colors, if set in config (each calendar separately)
		maxDaysToShow: 7, // maximum days to show
		showLocation: true, // show location link (right side)
		showMonth: false, // show month under day (left side)
		fullTextTime: true, // show advanced time messages, like: All day, until Friday 12
		showCurrentEventLine: true, // show a line between last and next event

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
		...config
		
	}
	
	if (typeof this.config.entities === 'string')
      this.config.entities = [{entity: config.entities}];
    this.config.entities.forEach((entity, i) => {
      if (typeof entity === 'string')
        this.config.entities[i] = { entity: entity };
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
		const titleColor = (this.config.showColors && event.config.color!== "undefined") ? event.config.color : this.config.titleColor
	
		return html`
		<a href="${event.link}" style="text-decoration: none;" target="_blank">
		<div class="event-title" style="color: ${titleColor}">${event.title}</div></a>
		`
	}
	
   /**
   * generate Hours HTML
   * 
   */
	getHoursHTML(event) {
		var today = moment()
		// full day events, no hours set
			// 1. One day only, or multiple day ends today -> 'All day'
			if (event.isFullOneDayEvent || (event.isFullMoreDaysEvent && moment(event.endTime).isSame(today,'day')))
				return html`<div>${this.config.fullDayEventText}</div>`
			// 2. Starts any day, ends later -> 'All day, end date'
			else if (event.isFullMoreDaysEvent )
				return html`<div>${this.config.fullDayEventText}, ${this.config.untilText.toLowerCase()} ${this.getCurrDayAndMonth(moment(event.endTime))}</div>`
			// 3. starts before today, ends after today -> 'date - date'
			else if (event.isFullMoreDaysEvent && (moment(event.startTime).isBefore(today,'day') || moment(event.andTime).isAfter(today,'day') ))
				return html`<div>${this.config.fullDayEventText}, ${this.config.untilText.toLowerCase()} ${this.getCurrDayAndMonth(moment(event.endTime))}</div>`
		// events with hours set
			//4. long term event, ends today -> 'until hour'
			else if(moment(event.startTime).isBefore(today,'day'))
				return html`<div>${this.config.untilText} ${event.endTime.format('LT')}</div>`
			//5. starts today or later, ends later -> 'hour - until date'
			else if(!moment(event.startTime).isBefore(today,'day') && moment(event.endTime).isAfter(event.startTime,'day'))
				return html`<div>${event.startTime.format('LT')}, ${this.config.untilText.toLowerCase()} ${this.getCurrDayAndMonth(moment(event.endTime))}</div>`
			// 6. Normal one day event, with time set -> 'hour - hour'
			else return html`
				<div>${event.startTime.format('LT')} - ${event.endTime.format('LT')}</div>`

	}

   /**
   * generate Event Location link HTML
   * 
   */
	getLocationHTML(event) {
	
		if (!event.location || !this.config.showLocation) return html``
		else return html`
			<div><a href="https://maps.google.com/?q=${event.location}" target="_blank" class="location-link"><ha-icon class="event-location-icon" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}</a></div>
		`
	}
	


	
   /**
   * update Calendar HTML
   * 
   */
	updateHTML(events){
	var htmlDays = ''
			
		if (!events)	
			{	// TODO some more tests end error message
				this.content =  html`The calendar cannot be loaded from the Home Assistant component.`
				return
			}
		// check if no events 
		// TODO: write something if no events
		if (events.length==0)	
			{	
				this.content =  html`No events in the next days`
				return 
			}

		// grouping events by days, returns object with days and events
		const groupsOfEvents = events.reduce(function (r,a) {
				r[a.daysToSort] = r[a.daysToSort] || []
				r[a.daysToSort].push(a);
				return r
			}, {})
			
		var days = Object.keys(groupsOfEvents).map(function(k){
			return groupsOfEvents[k];
			});

	
		// move today's finished events up
		// taking first day if today
		if (moment(days[0][0]).isSame(moment(), "day")) {
			var d = days[0]
			for(var i = days[0].length; i--; i>0) {
				if(days[0][i].isEventFinished) {
					days[0][i].isFinished=true
					var a = d.splice(i,1);
					d.unshift(a[0]);
				}
			}
			days[0] = d
		}
			
		//loop through days
		htmlDays=days.map((day, di) => {
			
			//loop through events for each day
			const htmlEvents=day.map((event,i, arr) => {
					const dayWrap = (i==0 && di > 0) ? 'border-top: 1px solid; padding-top: 4px; color: '+this.config.dayWrapperLineColor : ''
					
					//show line before next event
					const currentEventLine = (di==0 && this.config.showCurrentEventLine 
						&& moment(event.startTime).isAfter(moment()) && (i==0 || !moment(arr[i-1].startTime).isAfter(moment())) 
					) ? html`<div class="eventBar"><ha-icon icon="mdi:circle" class="event-circle"></ha-icon><hr class="event"/></div>` : ``

					//show current event progress bar
					var progressBar = ``
					if (di==0 && this.config.showProgressBar && event.isEventRunning) {
						let eventDuration = event.endTime.diff(event.startTime, 'minutes');
						let eventProgress = moment().diff(event.startTime, 'minutes');
						let eventPercentProgress= Math.floor((eventProgress * 100)/eventDuration);
						progressBar = html`<div class="progress-container"><ha-icon icon="mdi:circle" class="progress-circle" 	style="margin-left:${eventPercentProgress}%;"></ha-icon><hr class="progress" /></div>`;
					
					} 
					
			
					const finishedEventsStyle = (event.isFinished && this.config.dimFinishedEvents)? `opacity: `+this.config.finishedEventOpacity+`; filter: `+this.config.finishedEventFilter : ``
	
					return html`
					<tr style="${dayWrap}">
						<td class="event-left"><div>
								<div>${(i===0 && this.config.showMonth) ? event.startTimeToShow.format('MMM') : ''}</div>
								<div>${i===0 ? event.startTimeToShow.format('DD') : ''}</div>
								<div>${i===0 ? event.startTimeToShow.format('ddd') : ''}</div>
						</td>
						<td style="width: 100%; ${finishedEventsStyle}">
							<div>${currentEventLine}</div>
							<div class="event-right">
								<div class="event-main" >
									${this.getTitleHTML(event)}
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
  
  this.content =  html`${htmlDays}`
  }


   /**
   * gets events from HA Calendar
   * 
   */
	async getEvents() {
		let start = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');
		let end = moment().add(this.config.maxDaysToShow, 'days').format('YYYY-MM-DDTHH:mm:ss');
		let calendarUrlList = this.config.entities.map(entity => 
		`calendars/${entity.entity}?start=${start}Z&end=${end}Z`)
		//getting data from HA

		try{
		return await (Promise.all( calendarUrlList.map(url => 
		this.hass.callApi('get',url))).then((result) => {
				let ev = [].concat.apply([], (result.map((singleCalEvents,i) => {
				//getting each event from each calendar, passing settings, assuming calendars were resolved in the correct order
				return singleCalEvents.map(evt =>  new EventClass(evt,this.config.entities[i]))
			})))

		// sort events
		ev = ev.sort((a,b) => moment(a.startTimeToShow) - moment(b.startTimeToShow)   )
		return ev}))
		} catch (error) {
			console.log('error: ', error) 
			}
	}

	


   /**
   * ready-to-use function to remove year from moment format('LL')
   * @param {moment}
   * @return {String} [month, day]
   */

 getCurrDayAndMonth(locale) {
  var today = locale.format('LL');
  return today
    .replace(locale.format('YYYY'), '') // remove year
    .replace(/\s\s+/g, ' ')// remove double spaces, if any
    .trim() // remove spaces from the start and the end
    .replace(/[рг]\./, '') // remove year letter from RU/UK locales
    .replace(/de$/, '') // remove year prefix from PT
    .replace(/b\.$/, '') // remove year prefix from SE
    .trim() // remove spaces from the start and the end
    .replace(/,$/g, ''); // remove comma from the end
}





}
customElements.define('atomic-calendar', AtomicCalendar);




class EventClass {
	constructor(eventClass,config) {
		this.eventClass=eventClass;
		this.config=config;
		this._startTime= this.eventClass.start.dateTime ? moment(this.eventClass.start.dateTime) : moment(this.eventClass.start.date).startOf('day')
		this._endTime= this.eventClass.end.dateTime ? moment(this.eventClass.end.dateTime) : moment(this.eventClass.end.date).subtract(1, 'days').endOf('day')
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

	//start time, but returns today if before today
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
		if (!this.eventClass.start.dateTime && !this.eventClass.end.dateTime )
				return true
		else return false
	}
	// is full day event, but only one day
	get isFullOneDayEvent() {
		if (!this.eventClass.start.dateTime && !this.eventClass.end.dateTime && moment(this.eventClass.start.date).isSame(moment(this.eventClass.end.date).subtract(1, 'days'), 'day'))
				return true
		else return false
	}
	
	// is full day event, more days
	get isFullMoreDaysEvent() {
		if (!this.eventClass.start.dateTime && !this.eventClass.end.dateTime && !moment(this.eventClass.start.date).isSame(moment(this.eventClass.end.date).subtract(1, 'days'), 'day'))
			return true
		else return false
	}
	
	// return YYYYMMDD for sorting
	get daysToSort() {
		return moment(this.startTimeToShow).format('YYYYMMDD');
	}
	get isEventToday(){
		return (moment(this.eventClass.start.dateTime || this.eventClass.start.date).isSame(moment(), 'day') ?  true :  false);
	}
	
	get isEventTomorrow() {
		return moment(this.eventClass.start.dateTime || this.eventClass.start.date).isSame(moment().add(1,'day'), 'day') ?  true :  false;
	}
	
	get isEventRunning() {
		return (moment(this.startTime).isBefore(moment()) && moment(this.endTime).isAfter(moment()) )
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
