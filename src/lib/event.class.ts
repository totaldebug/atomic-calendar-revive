import dayjs from 'dayjs';

/**
 * Creates an generalized Calendar Event to use when creating the calendar card
 * There can be Google Events and CalDav Events. This class normalizes those
 */

export default class EventClass {
	isEmpty: boolean;
	private _eventClass: any;
	private _globalConfig: any;
	private _startDateTime: dayjs.Dayjs | undefined;
	private _endDateTime: dayjs.Dayjs | undefined;
	private _customOriginName: string | undefined;

	constructor(eventClass, globalConfig) {
		this._eventClass = eventClass;
		this._globalConfig = globalConfig;
		this.isEmpty = false;
	}

	get rawEvent() {
		return this._eventClass;
	}

	get id() {
		return (this.rawEvent.id || this.rawEvent.uid) + this.title;
	}

	get originCalendar() {
		return this.rawEvent.originCalendar;
	}

	get entity() {
		return this._eventClass.hassEntity || {};
	}

	get entityConfig() {
		return this._eventClass.entity || {};
	}

	set originName(value: string) {
		this._customOriginName = value;
	}

	get originName() {
		if (this._customOriginName !== undefined) {
			return this._customOriginName;
		}
		const { originCalendar } = this;
		if (originCalendar && originCalendar.name) {
			return originCalendar.name;
		}

		const { entity } = this;
		if (entity && entity.attributes && entity.attributes.friendly_name) {
			return entity.attributes.friendly_name;
		}

		if (originCalendar && originCalendar.entity) {
			return originCalendar.entity;
		}

		return (entity && entity.entity) || entity || 'Unknown';
	}

	/**
	 * get the start time for an event
	 * @return {String}
	 */
	get startDateTime() {
		if (this._startDateTime === undefined) {
			const date =
				(this.rawEvent.start && this.rawEvent.start.date) || this.rawEvent.start.dateTime || this.rawEvent.start || '';
			this._startDateTime = this._processDate(date);
		}

		return this._startDateTime!.clone();
	}

	/**
	 * get the end time for an event
	 * @return {String}
	 */
	get endDateTime() {
		if (this._endDateTime === undefined) {
			const date = (this.rawEvent.end && this.rawEvent.end.date) || this.rawEvent.end.dateTime || this.rawEvent.end;
			this._endDateTime = this._processDate(date, true);
		}

		return this._endDateTime!.clone();
	}
	get addDays() {
		return this.rawEvent.addDays !== undefined ? this.rawEvent.addDays : false;
	}

	get daysLong() {
		if (this._globalConfig.showMultiDay) {
			return this.rawEvent.daysLong;
		} else {
			const fullDays = Math.round(this.endDateTime.subtract(1, 'minutes').endOf('day').diff(this.startDateTime.startOf('day'), 'hours') / 24)

			return fullDays > 1 ? fullDays : undefined;
		}
	}

	get isFirstDay() {
		return this.rawEvent._isFirstDay;
	}

	get isLastDay() {
		return this.rawEvent._isLastDay;
	}

	/**
	 *
	 * @param {string} date
	 * @param {boolean} isEndDate
	 */
	_processDate(date, isEndDate = false) {
		if (!date) {
			return date;
		}

		date = dayjs(date);

		// add days to a start date for multi day event
		if (this.addDays !== false) {
			if (!isEndDate && this.addDays) {
				date = date.add(this.addDays, 'days');
			}

			// if not the last day and we are modifying the endDateTime then
			// set end dateTimeDate as end of start day for that partial event
			if (!this.isLastDay && isEndDate) {
				date = dayjs(this.startDateTime).endOf('day');
			} else if (this.isLastDay && !isEndDate) {
				// if last day and start time then set start as start of day
				date = date.startOf('day');
			}
		}

		return date;
	}

	/**
	 * is this recurring?
	 * @return {boolean}
	 */
	get isRecurring() {
		return !!this.rawEvent.recurringEventId;
	}

	/**
	 * is this declined?
	 * @return {boolean}
	 */
	get isDeclined() {
		const attendees = this.rawEvent.attendees || [];
		return attendees.filter((a) => a.self && a.responseStatus === 'declined').length !== 0;
	}

	/**
	 * is this still active?
	 * @return {boolean}
	 */
	get isRunning() {
		return this.startDateTime.isBefore(dayjs()) && this.endDateTime.isAfter(dayjs());
	}

	/**
	 * is this finished?
	 * @return {boolean}
	 */
	get isFinished() {
		// TODO: Fix needed for full / multi day event
		return this.endDateTime.isBefore(dayjs());
	}

	/**
	 * get the URL for an event
	 * @return {String}
	 */
	get htmlLink() {
		return this.rawEvent.htmlLink || '';
	}

	/**
	 * get the URL from the source element
	 * @return {String}
	 */
	get sourceUrl() {
		return this.rawEvent.source ? this.rawEvent.source.url || '' : '';
	}

	/**
	 * is a multiday event (not all day)
	 * @return {Boolean}
	 */
	get isMultiDay() {
		// if more than 24 hours we automatically know it's multi day
		if (this.endDateTime.diff(this.startDateTime, 'hours') > 24) {
			return true;
		}

		// end date could be at midnight which is not multi day but is seen as the next day
		// subtract one minute and if that made it one day then its NOT one day
		const daysDifference = Math.abs(this.startDateTime.date() - this.endDateTime.subtract(1, 'minute').date());
		if (daysDifference === 1 && this.endDateTime.hour() === 0 && this.endDateTime.minute() === 0) {
			return false;
		}

		return !!daysDifference;
	}

	/**
	 * is the event a full day event?
	 * @return {Boolean}
	 */
	get isAllDayEvent() {
		// if start and end are both "date" then it's an all day event
		if (this.rawEvent.start.date && this.rawEvent.end.date) {
			return true;
		}
		// check for days that are between multi days - they ARE all day
		if (!this.isFirstDay && !this.isLastDay && this.daysLong && this._globalConfig.showMultiDay) {
			return true;
		}
		// if start and end are both "dateTime" then it's NOT an all day event
		if (this.rawEvent.start.dateTime && this.rawEvent.end.dateTime) {
			return false
		}

		return undefined;
	}

	/**
	 * split event into a multi day event where it crosses to a new day
	 * @param {*} newEvent
	 */
	splitIntoMultiDay(newEvent) {
		const partialEvents: any[] = [];

		// multi days start at two days
		// every 24 hours is a day. if we do get some full days then just add to 1 daysLong
		// TODO: Confirm this works as expected
		let daysLong = 2;
		const fullDays = Math.round(this.endDateTime.subtract(1, 'minutes').endOf('day').diff(this.startDateTime.startOf('day'), 'hours') / 24)
		if (fullDays) {
			daysLong = fullDays;
		}

		for (let i = 0; i < daysLong; i++) {
			// copy event then add the current day/total days to 'new' event
			const copiedEvent = JSON.parse(JSON.stringify(newEvent.rawEvent));
			copiedEvent.addDays = i;
			copiedEvent.daysLong = daysLong;

			copiedEvent._isFirstDay = i === 0;
			copiedEvent._isLastDay = i === (daysLong - 1) && i > 0;

			// Create event object for each of the days the multi-event occurs on
			const partialEvent: EventClass = new EventClass(copiedEvent, this._globalConfig);
			// only add event if start date is before the maxDaysToShow and after
			// the current date
			const endDate = dayjs().startOf('day').add(this._globalConfig.maxDaysToShow, 'days');

			if (
				endDate.isAfter(partialEvent.startDateTime) &&
				dayjs().startOf('day').subtract(1, 'minute').isBefore(partialEvent.startDateTime)
			) {
				partialEvents.push(partialEvent);
			}
		}
		return partialEvents;
	}

	get titleColor() {
		if (this.entityConfig.eventTitleColor) {
			return this.entityConfig.eventTitleColor;
		} else {
			return 'var(--primary-text-color)';
		}
	}

	get title() {
		if (!this.rawEvent.summary) {
			if (this.entityConfig.eventTitle) {
				return this.entityConfig.eventTitle
			} else {
				return this._globalConfig.eventTitle
			}
		} else {
			return this.rawEvent.summary;
		}
	}

	get description() {
		// if Observance is in the description, filter it out
		const regex = new RegExp('^Observance', 'i');
		if (regex.test(this.rawEvent.description)) {
			return '';
		}
		return this.rawEvent.description;
	}

	//start time, returns today if before today
	get startTimeToShow() {
		const time = this.startDateTime;
		if (dayjs(time).isBefore(dayjs().startOf('day')) && !(this._globalConfig.startDaysAhead < 0)) {
			return dayjs().startOf('day');
		} else {
			return time;
		}
	}

	// return YYYYMMDD for sorting
	get daysToSort() {
		return this.startTimeToShow.format('YYYYMMDD');
	}

	get location() {
		return this.rawEvent.location ? this.rawEvent.location.split(' ').join('+') : '';
	}

	get address() {
		if (!this.rawEvent.location) {
			return '';
		}

		return this.rawEvent.location.split(',')[0];
	}

	get visibility() {
		return this.rawEvent.visibility;
	}
}
