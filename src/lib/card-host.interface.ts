import EventClass from './event.class';

export interface ICardHost {
	setLoading(loading: boolean): void;
	scheduleRender(): void;
	openEventDetail(event: EventClass): void;
}
