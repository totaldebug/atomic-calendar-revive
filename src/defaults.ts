export default {
	cardHeight: '100%',

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
	startDaysAhead: 0, // shows the events starting on x days from today. Default 0.
	showLastCalendarWeek: false, // always shows last line/week in calendar mode, even if it's not the current month

	sortBy: 'start', // sort first by start time or milestone
	allDayBottom: false, // show all day events at the bottom of the day
	disableEventLink: false, // disables links to event calendar
	disableLocationLink: false, // disables links to event calendar
	disableCalLocationLink: false,
	disableCalMonthLink: false, // disables the link on the month name in calendar mode
	linkTarget: '_blank', // Target for links, can use any HTML target type
	showDeclined: true, // show declined events in the calendar
	showPrivate: true, // show private events
	showHiddenText: true, //show the hidden events text
	showCalendarName: false,

	// color and font settings
	nameColor: 'var(--primary-text-color)', // Card Name color

	descColor: 'var(--primary-text-color)', // Description text color (left side)
	descSize: 80, //Description text size (percent of standard text)

	showNoEventsForToday: false,
	showNoEventDays: false,

	showHours: true, //shows the bottom line (time, duration of event)
	showRelativeTime: true,

	eventTitleColor: 'var(--primary-text-color)', //Event title settings (center top), if no custom color set

	locationIconColor: 'rgb(--primary-text-color)', //Location link settings (right side)
	locationTextSize: 90,

	// finished events settings
	hideFinishedEvents: false, // show finished events
	dimFinishedEvents: true, // make finished events greyed out or set opacity
	finishedEventOpacity: 0.6, // opacity level
	finishedEventFilter: 'grayscale(80%)', // css filter

	// days separating
	eventBarColor: 'var(--primary-color)',

	eventCalNameColor: 'var(--primary-text-color)',
	eventCalNameSize: 90,

	showProgressBar: true,
	showFullDayProgress: false,
	progressBarColor: 'var(--primary-color)',
	progressBarBackgroundColor: '#555',

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

	calEventTime: false, // show calendar event summary time

	firstDayOfWeek: 1, // default 1 - monday
	refreshInterval: 60,

	showEventIcon: false,
	europeanDate: false,
	hideDuplicates: false,

	showMultiDay: false,
	showMultiDayEventParts: false,
	showWeekNumber: false,
	showDescription: false,
	showEventDate: true,
	showDatePerEvent: false,
	showAllDayHours: true,
	showAllDayEvents: true,
	offsetHeaderDate: false,

	titleLength: 0,
	descLength: 0,
};
