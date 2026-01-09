import localize from './localize/localize';

export const mainSchema = [
	{ name: 'name', label: localize('main.fields.name'), selector: { text: {} } },
	{
		name: 'titleLength',
		label: localize('main.fields.titleLength'),
		selector: { number: { min: 0, max: 99999999999 } },
	},
	{
		name: 'descLength',
		label: localize('main.fields.descLength'),
		selector: { number: { min: 0, max: 99999999999 } },
	},
	{
		name: 'firstDayOfWeek',
		label: localize('main.fields.firstDayOfWeek'),
		selector: { select: { options: [], mode: 'dropdown' } },
	},
	{
		name: 'maxDaysToShow',
		label: localize('main.fields.maxDaysToShow'),
		selector: { number: { min: 0, max: 99999999999 } },
	},
	{
		name: 'startDaysAhead',
		label: localize('main.fields.startDaysAhead'),
		selector: { number: { min: 0, max: 999 } },
	},
	{
		name: 'refreshInterval',
		label: localize('main.fields.refreshInterval'),
		selector: { number: { min: 60, max: 99999999999 } },
	},
	{ name: 'dateFormat', label: localize('main.fields.dateFormat'), selector: { text: {} } },
	{ name: 'eventTitle', label: localize('main.fields.eventTitle'), selector: { text: {} } },
	{
		name: 'defaultMode',
		label: localize('main.fields.defaultMode'),
		selector: { select: { options: ['Event', 'Calendar', 'Planner'], mode: 'dropdown' } },
	},
	{
		name: 'linkTarget',
		label: localize('main.fields.linkTarget'),
		selector: { select: { options: ['_blank', '_self', '_parent', '_top'], mode: 'dropdown' } },
	},
	{
		name: 'sortBy',
		label: localize('main.fields.sortBy'),
		selector: { select: { options: ['start', 'milestone', 'none'], mode: 'dropdown' } },
	},
	{ name: 'cardHeight', label: localize('main.fields.cardHeight'), selector: { text: {} } },
	{ name: 'showLoader', label: localize('main.fields.showLoader'), selector: { boolean: {} } },
	{ name: 'showDate', label: localize('main.fields.showDate'), selector: { boolean: {} } },
	{ name: 'showEndTime', label: 'Show End Time', selector: { boolean: {} } },
	{ name: 'showDeclined', label: localize('main.fields.showDeclined'), selector: { boolean: {} } },
	{ name: 'hideFinishedEvents', label: localize('main.fields.hideFinishedEvents'), selector: { boolean: {} } },
	{ name: 'showLocation', label: localize('main.fields.showLocation'), selector: { boolean: {} } },
	{ name: 'showRelativeTime', label: localize('main.fields.showRelativeTime'), selector: { boolean: {} } },
	{ name: 'hideDuplicates', label: localize('main.fields.hideDuplicates'), selector: { boolean: {} } },
	{ name: 'showMultiDay', label: localize('main.fields.showMultiDay'), selector: { boolean: {} } },
	{
		name: 'showMultiDayEventParts',
		label: localize('main.fields.showMultiDayEventParts'),
		selector: { boolean: {} },
	},
	{ name: 'compactMode', label: localize('main.fields.compactMode'), selector: { boolean: {} } },
	{ name: 'showAllDayEvents', label: localize('main.fields.showAllDayEvents'), selector: { boolean: {} } },
	{ name: 'offsetHeaderDate', label: localize('main.fields.offsetHeaderDate'), selector: { boolean: {} } },
	{ name: 'allDayBottom', label: localize('main.fields.allDayBottom'), selector: { boolean: {} } },
];

export const eventSchema = [
	{ name: 'untilText', label: localize('event.fields.untilText'), selector: { text: {} } },
	{
		name: 'noEventsForNextDaysText',
		label: localize('event.fields.noEventsForNextDaysText'),
		selector: { text: {} },
	},
	{ name: 'noEventText', label: localize('event.fields.noEventText'), selector: { text: {} } },
	{ name: 'hiddenEventText', label: localize('event.fields.hiddenEventText'), selector: { text: {} } },
	{ name: 'eventDateFormat', label: localize('event.fields.eventDateFormat'), selector: { text: {} } },
	{ name: 'showCurrentEventLine', label: localize('event.fields.showCurrentEventLine'), selector: { boolean: {} } },
	{ name: 'showProgressBar', label: localize('event.fields.showProgressBar'), selector: { boolean: {} } },
	{ name: 'showMonth', label: localize('event.fields.showMonth'), selector: { boolean: {} } },
	{ name: 'showDescription', label: localize('event.fields.showDescription'), selector: { boolean: {} } },
	{ name: 'disableEventLink', label: localize('event.fields.disableEventLink'), selector: { boolean: {} } },
	{ name: 'disableLocationLink', label: localize('event.fields.disableLocationLink'), selector: { boolean: {} } },
	{ name: 'showNoEventsForToday', label: localize('event.fields.showNoEventsForToday'), selector: { boolean: {} } },
	{ name: 'showFullDayProgress', label: localize('event.fields.showFullDayProgress'), selector: { boolean: {} } },
	{ name: 'showEventIcon', label: localize('event.fields.showEventIcon'), selector: { boolean: {} } },
	{ name: 'showHiddenText', label: localize('event.fields.showHiddenText'), selector: { boolean: {} } },
	{ name: 'showCalendarName', label: localize('event.fields.showCalendarName'), selector: { boolean: {} } },
	{ name: 'showWeekNumber', label: localize('event.fields.showWeekNumber'), selector: { boolean: {} } },
	{ name: 'showEventDate', label: localize('event.fields.showEventDate'), selector: { boolean: {} } },
	{ name: 'showDatePerEvent', label: localize('event.fields.showDatePerEvent'), selector: { boolean: {} } },
	{ name: 'showTimeRemaining', label: localize('event.fields.showTimeRemaining'), selector: { boolean: {} } },
	{ name: 'showAllDayHours', label: localize('event.fields.showAllDayHours'), selector: { boolean: {} } },
	{ name: 'hoursOnSameLine', label: localize('event.fields.hoursOnSameLine'), selector: { boolean: {} } },
];

export const calendarSchema = [
	{ name: 'calShowDescription', label: localize('calendar.fields.calShowDescription'), selector: { boolean: {} } },
	{
		name: 'showLastCalendarWeek',
		label: localize('calendar.fields.showLastCalendarWeek'),
		selector: { boolean: {} },
	},
	{ name: 'disableCalEventLink', label: localize('calendar.fields.disableCalEventLink'), selector: { boolean: {} } },
	{
		name: 'disableCalLocationLink',
		label: localize('calendar.fields.disableCalLocationLink'),
		selector: { boolean: {} },
	},
	{ name: 'disableCalLink', label: localize('calendar.fields.disableCalLink'), selector: { boolean: {} } },
];

export const plannerSchema = [
	{
		name: 'plannerDaysToShow',
		label: localize('planner.fields.plannerDaysToShow'),
		selector: { number: { min: 1, max: 365 } },
	},
	{ name: 'plannerRollingWeek', label: localize('planner.fields.plannerRollingWeek'), selector: { boolean: {} } },
];

export const appearanceSchema = [
	{ name: 'dimFinishedEvents', label: localize('appearance.fields.dimFinishedEvents'), selector: { boolean: {} } },
];

export const entitySchema = [
	{ name: 'name', label: 'Name', selector: { text: {} } },
	{ name: 'icon', label: 'Icon', selector: { icon: {} } },
	{ name: 'color', label: 'Color', selector: { text: { type: 'color' } } },
	{ name: 'startTimeFilter', label: 'Start Time Filter', selector: { text: {} } },
	{ name: 'endTimeFilter', label: 'End Time Filter', selector: { text: {} } },
	{ name: 'maxDaysToShow', label: 'Max Days To Show', selector: { number: {} } },
	{ name: 'blocklist', label: 'Blocklist', selector: { text: {} } },
	{ name: 'blocklistLocation', label: 'Blocklist Location', selector: { text: {} } },
	{ name: 'allowlist', label: 'Allowlist', selector: { text: {} } },
	{ name: 'allowlistLocation', label: 'Allowlist Location', selector: { text: {} } },
	{ name: 'eventTitle', label: 'Event Title', selector: { text: {} } },
	{ name: 'showMultiDay', label: 'Show Multi Day', selector: { boolean: {} } },
];
