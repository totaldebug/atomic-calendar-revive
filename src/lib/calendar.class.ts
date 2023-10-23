import dayjs from 'dayjs';

/**
 * class for 42 calendar days
 *
 */
export default class CalendarDay {
	calendarDay: dayjs.Dayjs;
	_lp: any;
	ymd: string;
	private _allEvents: any[];

	constructor(calendarDay, d) {
		this.calendarDay = calendarDay;
		this._lp = d;
		this.ymd = dayjs(calendarDay).format('YYYY-MM-DD');
		this._allEvents = [];
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
}
