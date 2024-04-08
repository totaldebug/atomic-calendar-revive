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
	startTimeFilter?: string;
	endTimeFilter?: string;
	maxDaysToShow?: number;
	showMultiDay?: boolean;
	blocklist?: string;
	blocklistLocation?: string;
	allowlist?: string;
	allowlistLocation?: string;
	eventTitle?: string;
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

export type Constructor<T = any> = new (...args: any[]) => T;
