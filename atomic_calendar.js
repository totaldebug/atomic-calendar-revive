
import {
  LitElement, html
} from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';



class AtomicCalendar extends LitElement {
  static get properties() {

    return {
      hass: Object,
      config: Object,
	  content: Object
    }
  }

	constructor() {
		super();
		this.lastUpdateTime;
		this.events;
		this.content=html`<div>HTML before calendar read</div>`;
		this.shouldUpdateHtml = false;

	}
  
  updated(){
   
  }  
  
_render({ hass, config }) {

	if(!this.isUpdating){
		(async () => {
			this.isUpdating=true;

			// wait for moment.js or continue if already loaded
			if(typeof(moment) == "undefined"){
				//await this.loadScript('https://unpkg.com/moment@2.23.0/moment.js')
				await this.loadScript('/local/moment-with-locales.min.js')
				moment.locale(this.hass.language);
				this.events = await this.getEvents()
				this.updateHTML(this.events);

			}

			

			// get events from HA Calendar each 15 minutes
			else if (!this.lastUpdateTime || moment().diff(this.lastUpdateTime,'minutes') > 15) {
				 // this.getEvents();
				moment.locale(this.hass.language);
				this.events = await this.getEvents()
				this.lastUpdateTime = moment();
				this.shouldUpdateHtml = true;
				this.updateHTML(this.events);	
				}

		this.isUpdating=false;
		}
		)()
	}
	return this.content;

  }


  setStyle(){
	return html`
		<style>
			.cal-card{
		
				padding: 8px;
			}
			.cal-title {
				font-size: var(--paper-font-headline_-_font-size);
				color: var(--primary-text-color);
				padding: 16px 16px 5px 16px;
				
			}
			table{
				color:black;
			/*	border: 1px solid #ccc;*/
			/*	border-spacing: 0;*/
				/*display: flex;
				flex-flow: column nowrap;
				flex: 1 1 auto;*/
				margin-left: 5px;
				margin-right: 5px;
				
				
				  border-collapse: separate;
  border-spacing: 10px 5px;
   border-collapse: collapse;
				
			}

			td {
				/*display: flex;
				flex-flow: row nowrap;*/
				
						
				}
			
			tr{
				width: 100%;
				/*display: flex;
				flex-flow: row nowrap;*/

				
								 
			}

		

			.event-left {
				
			/*	flex: 0 0 20px;*/
				padding: 5px;
				padding-top: 7px;
				padding-left: 8px;
				padding-right: 10px;
				text-align: center;
		
				color: ${this.config.dateColor};
				font-size: ${this.config.dateSize}%;
				vertical-align: top;
						 
			}
			
			.event-right {
				/* display:inline-block;*/
				 display: flex;
				 justify-content: space-between;
				padding: 5px;
						 
			}
			
			.event-main {
				/*display:flex;*/
				/*flex: 1 1 auto;
				flex-direction:row nowrap;*/

				/*border: 1px solid #ccc;*/
				/*flex-direction: row */
				  display: inline-block;
				  vertical-align: top;
		
			}
			
			.event-location {
				text-align: right;
				display: inline-block;
				vertical-align: top;
			}
				
			.event-title {
				/*flex: 1 1 auto;*/
				font-size: ${this.config.titleSize}%;
				color: ${this.config.titleColor};
				
			}		
			
			.event-time {
				/*flex: 1 1 auto;*/
			
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
				
		</style>

		`

	}

  updateEvents() {
			this.lastUpdateTime = moment();
			this.shouldUpdateHtml = true;
	}


  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define entities');
    }
    this.config = {
		// text translations
		title: 'Kalendarz',
		fullDayEventText: 'Cały dzień',
		untilText: 'Do', 
		
		// main settings
		showColors: true,  // show calendar title colors, if set
		maxDaysToShow: 7,
		showLocation: true,
		showMonth: false, // show month under day

		dateColor: 'var(--primary-text-color)', // Date text color
		dateSize: 90, //Date text size

		timeColor: 'var(--primary-color)', // Time text color
		timeSize: 90, //Time text size

		titleColor: 'var(--primary-text-color)', //Event title settingss
		titleSize: 100,

		locationIconColor: 'rgb(230, 124, 115)', //Location link settings
		locationLinkColor: 'var(--primary-text-color)',
		locationTextSize: 90,
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

  
  eventHTML(event) {
	
	return html`<div>${event.startTime.format('DD')}</div>`
   }

	// generating Event Title HTML
	getTitleHTML(event) {
		//console.log(event)
		const titleColor = (this.config.showColors && event.config.color!== "undefined") ? event.config.color : this.config.titleColor
	
		return html`
		<a href="${event.link}" style="text-decoration: none;" target="_blank">
		<div class="event-title" style="color: ${titleColor}">${event.title}</div></a>
		`
	}
	
	//generating Event Time HTML
	getHoursHTML(event) {
		
		// 1. Full day event, one day only
		if (event.isFullDayEvent)
			return html`<div >${this.config.fullDayEventText}</div>`
		// 2. Event ends another day
		else if (event.endTime > moment().endOf('day'))
			{
				return html`
				<div>${this.config.untilText} ${event.endTime.format('LL')}</div>`
			}
		// 3. Normal one day event, with time set
		else return html`
			<div>${event.startTime.format('LT')} - ${event.endTime.format('LT')}</div>`
	}

	getLocationHTML(event) {
	
		if (!event.location || !this.config.showLocation) return html``
		else return html`
			<div><a href="https://maps.google.com/?q=${event.location}" target="_blank" class="location-link"><ha-icon class="event-location-icon" icon="mdi:map-marker"></ha-icon>&nbsp;${event.address}</a></div>
		`
	}
	
	//update Calendar HTML
	updateHTML(events){
		
		// check if no events 
		// TODO: write something if no events
		if (events.length==0)	
			{
				return 'No events in next days'
			}
		
		const table = ``
			

		// grouping events by days
		const groupsOfEvents = events.reduce(function (r,a) {
				r[a.daysToSort] = r[a.daysToSort] || []
				r[a.daysToSort].push(a);
				return r
			}, Object.create(null))

		
		//loop through days
		const htmlDays=Object.values(groupsOfEvents).map((d, di) => {
			
			//loop through events for each day
			const htmlEvents=Object.values(d).map((event,i) => {
					const dayWrap = (i==0 && di > 0) ? 'border-top: 1px solid ;' : ''
					//const hours = this.getHoursHTML(event)
		
					return html`
			<tr style="${dayWrap} ">
						<td class="event-left"><div>
								<div>${(i===0 && this.config.showMonth) ? event.startTimeToShow.format('MMM') : ''}</div>
								<div>${i===0 ? event.startTimeToShow.format('DD') : ''}</div>
								<div>${i===0 ? event.startTimeToShow.format('ddd') : ''}</div>

								<div></div>
							</td>
						<td >
							<div class="event-right">
								<div class="event-main">
									${this.getTitleHTML(event)}
									<div class="event-time">${this.getHoursHTML(event)}</div>
								</div>
								<div class="event-location">
									${this.getLocationHTML(event)}
								</div>
							</div>
							<div></div>
						</td>
						
					</tr>`
				})
			
			//daily html
			return htmlEvents
		})

		
this.content =  html`
      ${this.setStyle()}
	  

	  <ha-card class="cal-card">
		<div class="cal-title" >
			${this.config.title}
		</div>
		<div>
			<table><tbody>
				${htmlDays}
			</tbody></table>
		</div>
	  </ha-card>

     
    `;

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

		return await (Promise.all( calendarUrlList.map(url => 
		this.hass.callApi('get',url))).then((result) => {
				let ev = [].concat.apply([], (result.map((singleCalEvents,i) => {
				//getting each event from each calendar, passing settings, assuming calendars were resolved in the correct order
				return singleCalEvents.map(evt =>  new SingleEvent(evt,this.config.entities[i]))
			})))
		// sort events
		ev = ev.sort((a,b) => moment(a.startTimeToShow) - moment(b.startTimeToShow)   )
		return ev}))
	}

	
   /**
   * loads moment.js
   * @return {Promise}
   */
	async loadScript(src) {
		return new Promise(resolve => {
			const script = document.createElement('script');
			script.src = src;
			script.type = 'text/javascript';
			script.async = true;
			script.onload = resolve;
			document.body.appendChild(script);
		});
}


}
customElements.define('atomic-calendar', AtomicCalendar);



class SingleEvent {
	constructor(singleEvent,config) {
		this.singleEvent=singleEvent;
		this.config=config;
	}
	
	get titleColor() {
		if (this.config.color)
			return this.config.color;
		else return 'var(--primary-text-color)';
	}
	
	get title() {
		return this.singleEvent.summary
	}
	
	//true start time
	get startTime() {
		if (this.singleEvent.start.dateTime) return moment(this.singleEvent.start.dateTime)
		else return moment(this.singleEvent.start.date).local().startOf('day')
	}

	//start time, but returns today if before today
	get startTimeToShow() {
		var time = this.singleEvent.start.dateTime ? moment(this.singleEvent.start.dateTime) : moment(this.singleEvent.start.date).local().startOf('day')
		if (moment(time) < moment().startOf('day'))
			return moment().startOf('day') 
		    else return time
	}
	
	get endTime() {
		if (this.singleEvent.end.dateTime) return moment(this.singleEvent.end.dateTime)
		
		else return moment(this.singleEvent.end.date).subtract(1, 'days').endOf('day')
	}
	
	// is full day event, but only one day
	get isFullDayEvent() {
	console.log	(this.singleEvent.start.date)
		console.log	(this.singleEvent.end.date)
		if (!this.singleEvent.start.dateTime && !this.singleEvent.end.dateTime && moment(this.singleEvent.start.date).isSame(moment(this.singleEvent.end.date).subtract(1, 'days'), 'day'))
				return true
		else return false
	}
	
	// is full day event, more days
	get isFullMoreDaysEvent() {
		if (!this.singleEvent.start.dateTime && !this.singleEvent.end.dateTime && this.singleEvent.start.date !== this.singleEvent.end.date)
			return true
		else return false
	}
	
	// return YYYYMMDD for sorting
	get daysToSort() {
		return moment(this.startTimeToShow).format('YYYYMMDD');
	}
	get isEventToday(){
			return (moment(this.singleEvent.start.dateTime || this.singleEvent.start.date).isSame(moment(), 'day') ?  true :  false);
	}
	
	get isEventTomorrow() {
			return moment(this.singleEvent.start.dateTime || this.singleEvent.start.date).isSame(moment().add(1,'day'), 'day') ?  true :  false;

	}

	get location() {
		return this.singleEvent.location ? (this.singleEvent.location).split(' ').join('+') : '';

	}
	
	get address() {
		return this.singleEvent.location ? this.singleEvent.location.split(',')[0] : ''
	}

	get link() {
		return this.singleEvent.htmlLink
	}
}
