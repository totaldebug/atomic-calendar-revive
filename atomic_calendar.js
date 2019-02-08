
import {
  LitElement, html
} from 'https://unpkg.com/@polymer/lit-element@^0.5.2/lit-element.js?module';






class AtomicCalendar extends LitElement {
  static get properties() {

    return {
      hass: Object,
      config: Object,
    }
  }

	constructor() {
		super();
		this.lastUpdateTime;

		
	}
  
_render({ hass, config }) {

if(!this.isUpdating)
	(async () => {
		this.isUpdating=true;
		// wait for moment.js or continue if already loaded
		if(typeof(moment) == "undefined")
			await this.loadScript('https://unpkg.com/moment@2.23.0/moment.js').then(() => {
		});

		
		// get events from HA Calendar each 15 minutes
		if (!this.lastUpdateTime || moment().diff(this.lastUpdateTime,'minutes') > 15) {
			await this.getEvents();
			this.lastUpdateTime = moment();
			}
	//console.log('end of update');
	this.isUpdating=false;
	}
	)()

    return html`
      <style>
  
      </style>
	  

	  <ha-card>
		<div>
			${this.config.title}
		</div>
		
		
	  </ha-card>

     
    `;
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


   /**
   * gets events from HA Calendar
   * 
   */
	getEvents() {
		let start = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');
		let end = moment().add(this.config.maxDaysToShow-1, 'days').format('YYYY-MM-DDTHH:mm:ss');
		let calendarUrlList = this.config.entities.map(entity => 
		`calendars/${entity.entity}?start=${start}Z&end=${end}Z`)
		//getting data from HA
		let calendarEvents = Promise.all(calendarUrlList.map(url => this.hass.callApi('get',url)))
		.then((haEvent) => { 
			let events = [].concat.apply([], (haEvent.map((singleCalEvents,i) => {
				//getting each event from each calendar, passing settings, assuming calendars were resolved in the correct order
				return singleCalEvents.map(evt =>  new SingleEvent(evt,this.config.entities[i]))
			})))
		console.log(events)

			events.forEach(element =>
			{console.log(element.startTime)
				console.log(element.isFullDayEvent)
			})
	
		})
		.catch((error) => { console.log(error) });


	}

   /**
   * loads moment.pl
   * @return {Promise}
   */
	loadScript(src) {
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
		else return moment(this.singleEvent.start.date)
	}
	
	get endTime() {
		if (this.singleEvent.end.dateTime) return moment(this.singleEvent.end.dateTime)
		else return moment(this.singleEvent.start.date)
	}
	
	get isFullDayEvent() {
		if (!this.singleEvent.start.dateTime && this.singleEvent.start.date)
			return true
		else return false
	}
	
}