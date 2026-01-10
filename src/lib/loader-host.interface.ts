import EventClass from './event.class';

export interface ILoaderHost {
	showLoader: boolean;
	selectedEvent?: EventClass;
	requestUpdate(): void;
}
