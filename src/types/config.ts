import { LovelaceCardConfig } from 'custom-card-helpers';

export interface atomicCardConfig extends LovelaceCardConfig {
	entities?: any;
	type: string;
	name?: string;
	entity?: string;
	language?: string;
	daysToSort?: number;
	eventTitle?: string;

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
	hoursFormat?: string;
	startDaysAhead?: number;
	showLastCalendarWeek?: boolean;
	showCalNameInEvent?: boolean;
	sortByStartTime?: boolean;
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
	showFullDayProgress?: boolean;
	progressBarColor?: string;
	enableModeChange?: boolean;
	defaultMode: string;

	// Calendar Mode Default Settings
	calGridColor?: string;
	calDayColor?: string;
	calWeekDayColor?: string;
	calDateColor?: string;
	defaultCalColor?: string;
	calEventBackgroundColor?: string;
	calEventBackgroundFilter?: string;
	calActiveEventBackgroundColor?: string;
	calActiveEventBackgroundFilter?: string;
	calEventSatColor?: string;
	calEventSunColor?: string;
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
	firstDayOfWeek?: number;
	blacklist?: string;
	whitelist?: string;
	locationFilter?: string;
	disableCalLink?: boolean;
	removeDuplicates?: boolean;

	compactMode?: boolean;
	hoursOnSameLine?: boolean;
	showTimeRemaining?: boolean;
	showAllDayHours?: boolean;
}
