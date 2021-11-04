import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
	interface HTMLElementTagNameMap {
		'atomic-calendar-card-editor': LovelaceCardEditor;
		'atomic-calendar-card': LovelaceCard;
	}
}
export interface atomicCardConfig extends LovelaceCardConfig {
	entities?: any;
	type: string;
	name?: string;
	entity?: string;
	language?: string;
	daysToSort?: number;

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
	linkTarget?: string;
	showDeclined?: boolean;
	softLimit?: number;
	showPrivate?: boolean;
	showHiddenText?: boolean;
	hiddenEventText?: string;
	refreshInterval: number;

	// color and font settings
	nameColor?: string;
	dateColor?: string;
	dateSize?: number;
	descColor?: string;
	descSize?: number;
	descLength?: number;
	showNoEventsForToday?: boolean;
	showNoEventDays?: boolean;
	noEventText?: string;
	noEventsForNextDaysText?: string;
	timeColor?: string;
	timeSize?: number;
	showHours?: boolean;
	eventTitleColor?: string;
	eventTitleSize?: number;
	locationIconColor?: string;
	locationLinkColor?: string;
	locationTextSize?: number;

	// finished events settings
	hideFinishedEvents?: boolean;
	dimFinishedEvents?: boolean;
	finishedEventOpacity?: number;
	finishedEventFilter?: string;

	// days separating
	dayWrapperLineColor?: string;
	eventBarColor?: string;
	eventCalNameColor?: string;
	eventCalNameSize?: number;
	showProgressBar?: boolean;
	showFullDayProgress?: boolean;
	progressBarColor?: string;
	enableModeChange?: boolean;
	defaultMode?: string;

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
}

export interface LongDateFormatSpec {
	LTS: string;
	LT: string;
	L: string;
	LL: string;
	LLL: string;
	LLLL: string;

	// lets forget for a sec that any upper/lower permutation will also work

	lts?: string;
	lt?: string;
	l?: string;
	ll?: string;
	lll?: string;
	llll?: string;
}

//EDITOR TYPES
export interface EntityConfig {
	entity: string;
	type?: string;
	name?: string;
	icon?: string;
}

export interface ConfigEntity extends EntityConfig {
	type?: string;
	secondary_info?: 'entity-id' | 'last-changed';
	action_name?: string;
	service?: string;
	service_data?: object;
	url?: string;
}

export interface EntitiesEditorEvent {
	detail?: {
		entities?: EntityConfig[];
	};
	target?: EventTarget;
}

export interface EditorTarget extends EventTarget {
	value?: string;
	index?: number;
	checked?: boolean;
	configValue?: string;
}
