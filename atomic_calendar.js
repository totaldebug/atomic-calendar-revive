
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
				display: flex;
			}
			.cal-title {
				font-size: var(--paper-font-headline_-_font-size);
				color: var(--primary-text-color);
				padding: 16px 16px 5px 16px;
				
			}
			table{
				color:black;
				border: 1px solid #ccc;
				border-spacing: 0;
				display: flex;
				flex-flow: column nowrap;
				flex: 1 1 auto;
				margin-left: 5px;
				margin-right: 5px;
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

			.event-row {
				
				flex-direction: row;
			}

			.event-date {
				
				flex: 0 0 20px;
				padding: 5px;
				
				text-align: center;
				border: 1px solid #ccc;
				color: ${this.config.dateColor};
				font-size: ${this.config.dateSize}%;
				vertical-align: top;
			}
			
			.event-main {
			/*	display:flex;*/
				flex: 1 1 auto;
				flex-direction:column;
				padding: 5px;
				border: 1px solid #ccc;
				
			}
			
			.event-location {
		
				padding: 5px;
				flex: 0 0 40px;
			
				border: 1px solid #ccc;
				color: red;
				text-align: right;
				
}
				
			.event-title {
				flex: 1 1 auto;
				font-size: ${this.config.titleSize}%;
				color: ${this.config.titleColor};
				
			}		
			
			.event-time {
				flex: 1 1 auto;
			
				font-size: ${this.config.timeSize}%;
				color: ${this.config.timeColor};
			}			
			
			.event-location-icon {
			    height: 14px;
                width: 14px;
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
		title: 'Kalendarz',
		fullDayEventText: 'Cały dzień',
		showColors: true,  // show calendar title colors, if set
		maxDaysToShow: 7,
		dateColor: 'var(--primary-text-color)', // Date text color
		dateSize: 90, //Date text size

		timeColor: 'var(--primary-color)', // Time text color
		timeSize: 90, //Time text size

		titleColor: 'var(--primary-text-color)',
		titleSize: 100,
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
		console.log(event)
		const titleColor = (this.config.showColors && event.config.color!== "undefined") ? event.config.color : this.config.titleColor
		console.log(titleColor)
		return html`
		
		<div class="event-title" style="color: ${titleColor}">${event.title}</div>
		`
	}
	
	//generating Event Time HTML
	getHoursHTML(event) {
		var hours = ''
		
		if (event.isFullDayEvent)
			return html`
			<div >${this.config.fullDayEventText}</div>`

		if(event.startTime < moment().startOf('day'))
			hours += event.startTime.format('LT') + ' - '


		hours += event.endTime.format('LT')
				
		return html`
			<div>${hours}</div>
		`
	}

		getLocationHTML(event) {
		var location = ''
		if (!event.location) return html``
		
			location+=''
			location+=event.address
		

		return html`
			<div><ha-icon class="event-location-icon" icon="mdi:map-marker"></ha-icon>&nbsp;${location}</div>
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
		const htmlDays=Object.values(groupsOfEvents).map((d) => {
			
			//loop through events for each day
			const htmlEvents=Object.values(d).map((event,i) => {
		
					const hours = this.getHoursHTML(event)
		
					return html`
					<tr>
						<td class="event-date"><div>
								<div>${i===0 ? event.startTime.format('DD') : ''}</div>
								<div>${i===0 ? event.startTime.format('ddd') : ''}</div>
								<div></div>
							</div></td>
						<td class="event-main">
								${this.getTitleHTML(event)}
								<div class="event-time">${this.getHoursHTML(event)}</div>
						</td>
						<td class="event-location">${this.getLocationHTML(event)}</td>
					</tr>`
				})
			
			//daily html
			return htmlEvents
		})

		
this.content =  html`
      ${this.setStyle()}
	  

	  <ha-card>
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
		ev = ev.sort((a,b) => moment(a.startTime) - moment(b.startTime)   )
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
	
	get startTime() {
		if (this.singleEvent.start.dateTime) return moment(this.singleEvent.start.dateTime)
		else return moment(this.singleEvent.start.date).startOf('day')
	}
	
	get endTime() {
		if (this.singleEvent.end.dateTime) return moment(this.singleEvent.end.dateTime)
		else return moment(this.singleEvent.start.date).endOf('day')
	}
	
	get isFullDayEvent() {
		if (!this.singleEvent.start.dateTime && !this.singleEvent.end.dateTime)
			return true
		else return false
	}
	

	// return YYYYMMDD for sorting
	get daysToSort() {
		return moment(this.singleEvent.start.dateTime || this.singleEvent.start.date).format('YYYYMMDD');
	}
	get isEventToday(){
			return (moment(this.singleEvent.start.dateTime || this.singleEvent.start.date).isSame(moment(), 'day') ?  true :  false);
	}
	
	get isEventTomorrow() {
			return moment(this.singleEvent.start.dateTime || this.singleEvent.start.date).isSame(moment().add(1,'day'), 'day') ?  true :  false;

	}

	get location() {
		return this.singleEvent.location;

	}
	
	get address() {
		return this.singleEvent.location ? this.singleEvent.location.split(',')[0] : ''
	}
}
