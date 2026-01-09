import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import duration from 'dayjs/plugin/duration';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localeData from 'dayjs/plugin/localeData';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import week from 'dayjs/plugin/weekOfYear';
import { CSSResultGroup, LitElement, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './locale.dayjs';

dayjs.extend(updateLocale);
dayjs.extend(relativeTime);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(LocalizedFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(week);
dayjs.extend(duration);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

// Import Card Editor
import './editor';
import { CARD_VERSION } from './const';
import defaultConfig from './defaults';
import { getDefaultConfig } from './helpers/get-default-config';
import { setHass } from './helpers/globals';
import { registerCustomCard } from './helpers/register-custom-card';
import { getDate } from './lib/common.html';
import EventClass from './lib/event.class';
import { ILoaderHost } from './lib/loader-host.interface';
import { ICalendarView } from './lib/view.interface';
import { CalendarView } from './lib/views/CalendarView';
import { EventView } from './lib/views/EventView';
import { InlineCalendarView } from './lib/views/InlineCalendarView';
import { PlannerView } from './lib/views/PlannerView';
import localize from './localize/localize';
import { styles } from './style';
import { atomicCardConfig } from './types/config';
import { HomeAssistant, TimeFormat } from './types/homeassistant';
import { LovelaceCardEditor } from './types/lovelace';

@customElement('atomic-calendar-revive')
export class AtomicCalendarRevive extends LitElement implements ILoaderHost {
	@property() public hass!: HomeAssistant;
	@property() private _config!: atomicCardConfig;
	@property() private content;
	@property() public showLoader: boolean = false;
	@state() public selectedEvent?: EventClass;

	shouldUpdateHtml: boolean;
	errorMessage: TemplateResult;
	modeToggle: string;
	firstrun: boolean;
	language: string;

	private currentView!: ICalendarView;

	constructor() {
		super();

		this.content = html``;
		this.shouldUpdateHtml = true;
		this.errorMessage = html``;
		this.modeToggle = '';
		this.firstrun = true;
		this.language = '';
	}

	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		return document.createElement('atomic-calendar-revive-editor') as LovelaceCardEditor;
	}

	public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
		// get available energy entities
		return getDefaultConfig(hass);
	}

	public setConfig(config: atomicCardConfig): void {
		setHass(this.hass);
		if (!config) {
			throw new Error(localize('errors.invalid_configuration'));
		}
		if (!config.entities || !config.entities.length) {
			throw new Error(localize('errors.no_entities'));
		}

		const customConfig: atomicCardConfig = JSON.parse(JSON.stringify(config));

		this._config = {
			...defaultConfig,
			...customConfig,
		} as atomicCardConfig;

		this.modeToggle = this._config.defaultMode!;

		if (typeof this._config.entities === 'string') {
			this._config.entities = [
				{
					entity: config.entities,
				},
			];
		}
		this._config.entities.forEach((entity, i) => {
			if (typeof entity === 'string') {
				this._config.entities[i] = {
					entity: entity,
				};
			}
		});
	}

	protected render(): TemplateResult | void {
		setHass(this.hass);
		if (this.firstrun) {
			this.language =
				typeof this._config.language != 'undefined'
					? this._config.language!
					: this.hass.locale
						? this.hass.locale.language.toLowerCase()
						: this.hass.language.toLowerCase();

			dayjs.locale(this.language);

			const timeFormat =
				this.hass.locale?.time_format == TimeFormat.am_pm
					? 'hh:mma'
					: this.hass.locale?.time_format == TimeFormat.twenty_four
						? 'HH:mm'
						: dayjs().localeData().longDateFormat('LT');
			dayjs.updateLocale(this.language, {
				weekStart: this._config.firstDayOfWeek!,
				formats: {
					LT: timeFormat,
				},
			});

			console.groupCollapsed(
				`%c atomic-calendar-revive %c ${localize('common.version')}: ${CARD_VERSION}`,
				'color: white; background: #484848; font-weight: 700;',
				'color: white; background: #cc5500; font-weight: 700;',
			);
			console.log(`'Language:'`, `${this.language}`);
			console.log(`'HASS Timezone:'`, `${this.hass.config.time_zone}`);
			console.log(`'DayJS Timezone:'`, `${dayjs.tz.guess()}`);
			console.groupEnd();
		}
		if (!this._config || !this.hass) {
			return html``;
		}
		this.updateCard();

		if (this._config.hideCardIfNoEvents && this.currentView && !this.currentView.hasEvents && !this.showLoader) {
			return html``;
		}

		const compactMode = this._config.compactMode ? 'compact' : '';

		return html`<ha-card
			class="cal-card"
			style="${this._config.compactMode ? 'line-height: 80%;' : ''} --card-height: ${this._config.cardHeight}"
		>
			${this.renderModal()}
			${this._config.name || this._config.showDate || (this.showLoader && this._config.showLoader)
				? html` <div class="header ${compactMode}">
						${this._config.name
							? html`<div
									class="header-name ${compactMode}"
									style="color: ${this._config.nameColor};"
									@click="${() => this.handleToggle()}"
								>
									${this._config.name}
								</div>`
							: ''}
						${this.showLoader && this._config.showLoader ? html`<div class="loader"></div>` : ''}
						${this._config.showDate ? html`<div class="header-date ${compactMode}">${getDate(this._config)}</div>` : ''}
					</div>`
				: ''}
			<div class="cal-eventContainer" style="padding-top: 4px;">
				${this.currentView ? this.currentView.render() : html``}
			</div>
		</ha-card>`;
	}

	private renderModal(): TemplateResult {
		if (!this.selectedEvent) {
			return html``;
		}
		const event = this.selectedEvent;

		return html`
			<div class="modal open" @click="${() => (this.selectedEvent = undefined)}">
				<div class="modal-content" @click="${(e) => e.stopPropagation()}">
					<span class="modal-close" @click="${() => (this.selectedEvent = undefined)}">&times;</span>
					<div class="modal-event-title">${event.title}</div>
					<div class="modal-event-time">
						${event.isAllDayEvent
							? localize('common.fullDayEventText')
							: `${event.startDateTime.format('LT')} - ${event.endDateTime.format('LT')}`}
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Updates the entire card
	 */
	async updateCard() {
		this.firstrun = false;

		// Initialize view if needed or if mode changed
		if (
			!this.currentView ||
			(this.modeToggle === 'Event' && !(this.currentView instanceof EventView)) ||
			(this.modeToggle === 'Calendar' && !(this.currentView instanceof CalendarView)) ||
			(this.modeToggle === 'Planner' && !(this.currentView instanceof PlannerView)) ||
			(this.modeToggle === 'Inline' && !(this.currentView instanceof InlineCalendarView))
		) {
			if (this.modeToggle === 'Event') {
				this.currentView = new EventView(this);
			} else if (this.modeToggle === 'Calendar') {
				this.currentView = new CalendarView(this);
			} else if (this.modeToggle === 'Planner') {
				this.currentView = new PlannerView(this);
			} else if (this.modeToggle === 'Inline') {
				this.currentView = new InlineCalendarView(this);
			} else {
				this.currentView = new EventView(this);
			}
		}

		await this.currentView.update(this.hass, this._config);
	}

	handleToggle() {
		if (this._config.enableModeChange) {
			if (this.modeToggle === 'Event') {
				this.modeToggle = 'Calendar';
			} else if (this.modeToggle === 'Calendar') {
				this.modeToggle = 'Planner';
			} else if (this.modeToggle === 'Planner') {
				this.modeToggle = 'Inline';
			} else {
				this.modeToggle = 'Event';
			}
			this.requestUpdate();
		}
	}

	static get styles(): CSSResultGroup {
		return styles;
	}

	// The height of your card. Home Assistant uses this to automatically
	// distribute all cards over the available columns.
	getCardSize() {
		return this._config.entities.length + 1;
	}

	_toggle(state) {
		this.hass!.callService('homeassistant', 'toggle', {
			entity_id: state.entity_id,
		});
	}
}

registerCustomCard({
	type: 'atomic-calendar-revive',
	name: 'Atomic Calendar Revive',
	description: 'An advanced calendar card for Home Assistant with Lovelace.',
});
