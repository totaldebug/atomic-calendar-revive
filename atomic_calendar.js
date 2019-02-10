
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
				const events = await this.getEvents()
				this.updateHTML(events);

			}

			

			// get events from HA Calendar each 15 minutes
			else if (!this.lastUpdateTime || moment().diff(this.lastUpdateTime,'minutes') > 15) {
				 // this.getEvents();
				moment.locale(this.hass.language);
				const events = await this.getEvents()
				this.lastUpdateTime = moment();
				this.shouldUpdateHtml = true;
				this.updateHTML(events);	
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
			}

			td {
				display: flex;
				flex-flow: row nowrap;
				}
			
			tr{
				width: 100%;
				display: flex;
				flex-flow: row nowrap;
			}

			.event-row {
				
				flex-direction: row;
			}

			.event-date {
				
        
				flex: 0 0 20px;
				padding: 5px;
				border: 1px solid #ccc;
				color: blue;
			}
			
			.event-main {
				display:flex;
				flex: 1 1 auto;
				flex-direction:column;
				padding: 5px;
				border: 1px solid #ccc;
				color: red;
			}
			
			.event-location {
		

				flex: 0 0 40px;
				padding: 5px;
				border: 1px solid #ccc;
				color: red;
				
			.event-title {
				flex: 1 1 auto;
				padding: 5px;
				border: 1px solid #ccc;
				color: red;
			}		
			
			.event-time {
				flex: 1 1 auto;
				padding: 5px;
				border: 1px solid #ccc;
				color: red;
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
		maxDaysToShow: 5,
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


hoursHTML(event) {
	return html`
		
	`
}

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
	
				const hours = this.hoursHTML(event)
	
				return html`
				<tr>
					<td class="event-date"><div>
							<div>${i===0 ? event.startTime.format('dd') : ''}</div>
							<div>${i===0 ? event.startTime.format('DD') : ''}</div>
							<div></div>
						</div></td>
					<td class="event-main">
							<div class="event-title">${event.title}</div>
							<div class="event-time">Date</div>
					</td>
					<td class="event-location">Location</td>
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
		let end = moment().add(this.config.maxDaysToShow-1, 'days').format('YYYY-MM-DDTHH:mm:ss');
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
   * loads moment.pl
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
	constructor(singleEvent,settings) {
		this.singleEvent=singleEvent;
		this.settings=settings;
	}
	
	get color() {
		if (this.settings.color)
			return this.settings.color;
		else return "black";
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
		if (!this.singleEvent.start.dateTime && this.singleEvent.start.date)
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


	
}
