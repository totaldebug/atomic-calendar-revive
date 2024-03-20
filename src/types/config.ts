export interface atomicCardConfig {
	entities?: any;
	type: string;
	name?: string;
	entity?: string;
	language?: string;
	daysToSort?: number;
	eventTitle?: string;
	cardHeight?: string;
	sortBy?: string;
	showMultiDay: boolean;
	showMultiDayEventParts?: boolean;
	hideDuplicates: boolean;

	// text translations
	fullDayEventText?: string;
	untilText?: string;

	maxDaysToShow?: number;
	maxEventCount?: number;
	showLoader?: boolean;
	showLocation?: boolean;
	showMonth?: boolean;
	showWeekDay?: boolean;
	fullTextTime?: boolean;
	showCurrentEventLine?: boolean;
	showDate?: boolean;
	dateFormat?: string;
	startDaysAhead?: number;
	showLastCalendarWeek?: boolean;
	showCalNameInEvent?: boolean;
	disableEventLink?: boolean;
	disableLocationLink?: boolean;
	linkTarget: string;
	showDeclined?: boolean;
	softLimit?: number;
	showPrivate?: boolean;
	showHiddenText?: boolean;
	hiddenEventText?: string;
	refreshInterval: number;
	showDescription: boolean;
	showEventIcon: boolean;
	showEventDate: boolean;
	showDatePerEvent: boolean;
	showRelativeTime?: boolean;
	europeanDate?: boolean;
	showWeekNumber?: boolean;
	showAllDayEvents: boolean;

	// color and font settings
	nameColor?: string;
	descColor?: string;
	descSize?: number;
	titleLength?: number;
	descLength?: number;
	showNoEventsForToday?: boolean;
	showNoEventDays?: boolean;
	noEventText?: string;
	noEventsForNextDaysText?: string;
	showHours?: boolean;
	eventTitleColor?: string;
	locationIconColor?: string;
	locationTextSize?: number;

	// finished events settings
	hideFinishedEvents?: boolean;
	dimFinishedEvents?: boolean;
	finishedEventOpacity?: number;
	finishedEventFilter?: string;

	// days separating
	eventBarColor?: string;
	eventCalNameColor?: string;
	eventCalNameSize?: number;
	showProgressBar?: boolean;
	progressBarBackgroundColor: string;
	showFullDayProgress?: boolean;
	progressBarColor?: string;
	enableModeChange?: boolean;
	defaultMode: string;

	// Calendar Mode Settings
	calGridColor?: string;
	calDayColor?: string;
	calWeekDayColor?: string;
	calDateColor?: string;
	defaultCalColor?: string;
	calEventBackgroundColor?: string;
	calEventBackgroundFilter?: string;
	calActiveEventBackgroundColor?: string;
	calActiveEventBackgroundFilter?: string;
	calEventHolidayColor?: string;
	calEventHolidayFilter?: string;
	calEventIcon1?: string;
	calEventIcon1Color?: string;
	calEventIcon1Filter?: string;
	calEventIcon2?: string;
	calEventIcon2Color?: string;
	calEventIcon2Filter?: string;
	calEventIcon3?: string;
	calEventIcon3Color?: string;
	calEventIcon3Filter?: string;
	calEventTime?: boolean;
	calShowDescription: boolean;
	firstDayOfWeek?: number;
	blacklist?: string;
	whitelist?: string;
	locationFilter?: string;
	disableCalLink?: boolean;
	removeDuplicates?: boolean;
	disableCalLocationLink?: boolean;
	offsetHeaderDate?: boolean;

	compactMode?: boolean;
	hoursOnSameLine?: boolean;
	showTimeRemaining?: boolean;
	showAllDayHours?: boolean;
	showCalendarName?: boolean;
}
