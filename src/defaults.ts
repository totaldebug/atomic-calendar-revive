import { localize } from './localize/localize';

export default {
	cardHeight: "100%",

	// text translations
	fullDayEventText: localize('common.fullDayEventText'), // "All day" custom text
	untilText: localize('common.untilText'), // "Until" custom text

	// main settings
	maxDaysToShow: 7, // maximum days to show (if zero, show only currently running events)
	maxEventCount: 0, // maximum number of events to show (if zero, unlimited)
	showLoader: true, // show animation when loading events from Google calendar

	showLocation: true, // show location (right side)
	showMonth: false, // show month under day (left side)
	showWeekDay: false, // show day name under day (left side)
	fullTextTime: true, // show advanced time messages, like: All day, until Friday 12
	showCurrentEventLine: false, // show a line between last and next event
	showDate: false,
	dateFormat: 'LL',
	hoursFormat: '24h', // 12h / 24h.
	startDaysAhead: 0, // shows the events starting on x days from today. Default 0.
	showLastCalendarWeek: false, // always shows last line/week in calendar mode, even if it's not the current month

	sortByStartTime: true, // sort first by calendar, then by time
	disableEventLink: false, // disables links to event calendar
	disableLocationLink: false, // disables links to event calendar
	disableCalMonthLink: false, // disables the link on the month name in calendar mode
	linkTarget: '_blank', // Target for links, can use any HTML target type
	showDeclined: false, // Show declined events in the calendar
	showPrivate: true, // hide private events
	showHiddenText: true, //show the hidden events text
	hiddenEventText: localize('common.hiddenEventText'),

	// color and font settings
	nameColor: 'var(--primary-text-color)', // Card Name color

	dateColor: 'var(--primary-text-color)', // Date text color (left side)
	dateSize: 90, //Date text size (percent of standard text)

	descColor: 'var(--primary-text-color)', // Description text color (left side)
	descSize: 80, //Description text size (percent of standard text)

	showNoEventsForToday: false,
	noEventText: localize('common.noEventText'),
	noEventsForNextDaysText: localize('common.noEventsForNextDaysText'),
	showNoEventDays: false,


	timeColor: 'var(--primary-color)', // Time text color (center bottom)
	timeSize: 90, //Time text size
	showHours: true, //shows the bottom line (time, duration of event)
	showRelativeTime: true,

	eventTitleColor: 'var(--primary-text-color)', //Event title settings (center top), if no custom color set
	eventTitleSize: 100,

	locationIconColor: 'rgb(--primary-text-color)', //Location link settings (right side)
	locationLinkColor: 'var(--primary-text-color)',
	locationTextSize: 90,

	// finished events settings
	hideFinishedEvents: false, // show finished events
	dimFinishedEvents: true, // make finished events greyed out or set opacity
	finishedEventOpacity: 0.6, // opacity level
	finishedEventFilter: 'grayscale(80%)', // css filter

	// days separating
	dayWrapperLineColor: 'var(--primary-text-color)', // days separating line color
	eventBarColor: 'var(--primary-color)',

	eventCalNameColor: 'var(--primary-text-color)',
	eventCalNameSize: 90,

	showProgressBar: true,
	showFullDayProgress: false,
	progressBarColor: 'var(--primary-color)',
	progressBarBufferColor: 'var(--secondary-color)',

	enableModeChange: false,
	defaultMode: 'Event',

	// Calendar Mode Default Settings

	calGridColor: 'rgba(86, 86, 86, .35)',
	calDayColor: 'var(--primary-text-color)',
	calWeekDayColor: 'var(--primary-text-color)',
	calDateColor: 'var(--primary-text-color)',
	defaultCalColor: 'var(--primary-text-color)',

	calEventBackgroundColor: 'rgba(86, 100, 86, .35)',

	calActiveEventBackgroundColor: 'rgba(86, 128, 86, .35)',
	calEventSatColor: 'rgba(255, 255, 255, .05)',
	calEventSunColor: 'rgba(255, 255, 255, .15)',

	calEventTime: false, // show calendar event summary time

	firstDayOfWeek: 1, // default 1 - monday
	refreshInterval: 60,

	showEventIcon: false,
	europeanDate: false,
};
