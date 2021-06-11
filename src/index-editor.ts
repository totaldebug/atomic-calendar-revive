import { LitElement, html, customElement, TemplateResult, CSSResult, property } from 'lit-element';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { fireEvent } from './helpers/fire-event';
import { localize } from './localize/localize';
import { style } from './style-editor';
import { atomicCardConfig } from './types';

const linkTargets: string[] = ['_blank', '_self', '_parent', '_top'];
const defaultModes: string[] = ['Event', 'Calendar'];

const options = {
	required: {
		icon: 'tune',
		show: true,
	},
	main: {
		icon: 'eye-settings',
		show: false,
	},
	event: {
		icon: 'calendar-check',
		show: false,
	},
	calendar: {
		icon: 'calendar-month-outline',
		show: false,
	},
	appearance: {
		icon: 'palette',
		show: false,
	},
};

@customElement('atomic-calendar-revive-editor')
export class AtomicCalendarReviveEditor extends LitElement implements LovelaceCardEditor {
	@property() public hass?: HomeAssistant;
	@property() private _config?: atomicCardConfig;
	@property() private _toggle?: boolean;

	static get styles(): CSSResult {
		return style;
	}

	public setConfig(config: atomicCardConfig): void {
		this._config = config;
	}

	get _entity(): string {
		if (this._config) {
			return this._config.entity || '';
		}

		return '';
	}

	//MAIN SETTINGS
	get _name(): string {
		if (this._config) {
			return this._config.name || '';
		}
		return '';
	}

	get _firstDayOfWeek(): number {
		if (this._config) {
			return this._config.firstDayOfWeek || 1;
		}
		return 7;
	}

	get _maxDaysToShow(): number {
		if (this._config) {
			return this._config.maxDaysToShow || 7;
		}
		return 7;
	}

	get _linkTarget(): string {
		if (this._config) {
			return this._config.linkTarget || '_blank';
		}
		return '_blank';
	}
	get _defaultMode(): string {
		if (this._config) {
			return this._config.defaultMode || 'Event';
		}
		return 'Events';
	}
	get _cardHeight(): string {
		if (this._config) {
			return this._config.cardHeight || '100%';
		}
		return '100%';
	}

	get _showLocation(): boolean {
		if (this._config) {
			return this._config.showLocation || true;
		}
		return false;
	}
	get _showLoader(): boolean {
		if (this._config) {
			return this._config.showLoader || true;
		}
		return false;
	}
	get _sortByStartTime(): boolean {
		if (this._config) {
			return this._config.sortByStartTime || false;
		}
		return true;
	}
	get _showDeclined(): boolean {
		if (this._config) {
			return this._config.showDeclined || false;
		}
		return false;
	}
	get _dateFormat(): string {
		if (this._config) {
			return this._config.dateFormat || 'LL';
		}
		return 'LL';
	}
	get _hoursFormat(): string {
		if (this._config) {
			return this._config.hoursFormat || 'default';
		}
		return 'default';
	}
	get _refreshInterval(): string {
		if (this._config) {
			return this._config.refreshInterval || '60';
		}
		return '60';
	}
	get _showDate(): boolean {
		if (this._config) {
			return this._config.showDate || false;
		}

		return true;
	}
	get _showRelativeTime(): boolean {
		if (this._config) {
			return this._config.showRelativeTime || false;
		}

		return true;
	}
	// MAIN SETTINGS END

	// EVENT SETTINGS

	get _showCurrentEventLine(): boolean {
		if (this._config) {
			return this._config.showCurrentEventLine || false;
		}
		return true;
	}

	get _showProgressBar(): boolean {
		if (this._config) {
			return this._config.showProgressBar || true;
		}
		return false;
	}

	get _showMonth(): boolean {
		if (this._config) {
			return this._config.showMonth || false;
		}
		return true;
	}
	get _showWeekDay(): boolean {
		if (this._config) {
			return this._config.showWeekDay || false;
		}
		return true;
	}
	get _showDescription(): boolean {
		if (this._config) {
			return this._config.showDescription || true;
		}
		return false;
	}
	get _disableEventLink(): boolean {
		if (this._config) {
			return this._config.disableEventLink || false;
		}
		return true;
	}
	get _disableLocationLink(): boolean {
		if (this._config) {
			return this._config.disableLocationLink || false;
		}
		return true;
	}
	get _showNoEventsForToday(): boolean {
		if (this._config) {
			return this._config.showNoEventsForToday || false;
		}
		return true;
	}
	get _showCalNameInEvent(): boolean {
		if (this._config) {
			return this._config.showCalNameInEvent || false;
		}
		return true;
	}
	get _showFullDayProgress(): boolean {
		if (this._config) {
			return this._config.showFullDayProgress || false;
		}
		return true;
	}
	get _hideFinishedEvents(): boolean {
		if (this._config) {
			return this._config.hideFinishedEvents || false;
		}
		return true;
	}
	get _showEventIcon(): boolean {
		if (this._config) {
			return this._config.showEventIcon || false;
		}
		return true;
	}
	get _untilText(): string {
		if (this._config) {
			return this._config.untilText || '';
		}
		return '';
	}
	get _fullDayEventText(): string {
		if (this._config) {
			return this._config.fullDayEventText || '';
		}
		return '';
	}
	get _noEventsForNextDaysText(): string {
		if (this._config) {
			return this._config.noEventsForNextDaysText || '';
		}
		return '';
	}
	get _noEventText(): string {
		if (this._config) {
			return this._config.noEventText || '';
		}
		return '';
	}
	get _showHiddenText(): boolean {
		if (this._config) {
			return this._config.showHiddenText || false;
		}
		return true;
	}
	get _hiddenEventText(): string {
		if (this._config) {
			return this._config.hiddenEventText || '';
		}
		return '';
	}
	// EVENT SETTINGS END

	// CALENDAR SETTINGS
	get _showLastCalendarWeek(): boolean {
		if (this._config) {
			return this._config.showLastCalendarWeek || false;
		}
		return true;
	}
	get _disableCalEventLink(): boolean {
		if (this._config) {
			return this._config.disableCalEventLink || false;
		}
		return true;
	}
	get _disableCalLocationLink(): boolean {
		if (this._config) {
			return this._config.disableCalLocationLink || false;
		}
		return true;
	}
	get _calShowDescription(): boolean {
		if (this._config) {
			return this._config.calShowDescription || false;
		}
		return true;
	}

	get _disableCalLink(): boolean {
		if (this._config) {
			return this._config.disableCalLink || false;
		}
		return true;
	}

	// CALENDAR SETTINGS END

	// APPEARENCE SETTINGS

	get _locationLinkColor(): string {
		if (this._config) {
			return this._config.locationLinkColor || '';
		}
		return '';
	}
	get _dimFinishedEvents(): boolean {
		if (this._config) {
			return this._config.dimFinishedEvents || true;
		}
		return false;
	}

	// APPEARENCE SETTINGS END

	protected render(): TemplateResult | void {
		if (!this.hass) {
			return html``;
		}

		// You can restrict on domain type
		// const entities = Object.keys(this.hass.states).filter((eid) => eid.substr(0, eid.indexOf('.')) === 'sun');
		return html`
			<div class="card-config">
				<div class="option" @click=${this._toggleOption} .option=${'required'}>
					<div class="row">
						<ha-icon .icon=${`mdi:${options.required.icon}`}></ha-icon>
						<div class="title">${localize('required.name')}</div>
					</div>
					<div class="secondary">${localize('required.secondary')}</div>
				</div>
				${options.required.show
				? html`
							<div class="values">
								<span>Entities and their options must be configured through code editor</span>
							</div>
					  `
				: ''}
				<!-- MAIN SETTINGS -->
				<div class="option" @click=${this._toggleOption} .option=${'main'}>
					<div class="row">
						<ha-icon .icon=${`mdi:${options.main.icon}`}></ha-icon>
						<div class="title">${localize('main.name')}</div>
					</div>
					<div class="secondary">${localize('main.secondary')}</div>
				</div>
				${options.main.show
				? html`
							<div class="values">
								<paper-input
									label="${localize('main.fields.name')}"
									.value=${this._name}
									.configValue=${'name'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<div class="side-by-side">
									<div>
										<paper-input
											label="${localize('main.fields.firstDayOfWeek')}"
											type="number"
											.value=${this._firstDayOfWeek}
											.configValue=${'firstDayOfWeek'}
											@value-changed=${this._valueChanged}
										></paper-input>
									</div>
									<div>
										<paper-input
											label="${localize('main.fields.maxDaysToShow')}"
											type="number"
											.value=${this._maxDaysToShow}
											.configValue=${'maxDaysToShow'}
											@value-changed=${this._valueChanged}
										></paper-input>
									</div>
								</div>
								<paper-input
									label="${localize('main.fields.refreshInterval')}"
									type="number"
									.value=${this._refreshInterval}
									.configValue=${'refreshInterval'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<paper-input
									label="${localize('main.fields.dateFormat')}"
									.value=${this._dateFormat}
									.configValue=${'dateFormat'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<paper-input
									label="${localize('main.fields.hoursFormat')}"
									.value=${this._hoursFormat}
									.configValue=${'hoursFormat'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<paper-dropdown-menu
									label="${localize('main.fields.defaultMode')}"
									@value-changed=${this._valueChanged}
									.configValue=${'defaultMode'}
								>
									<paper-listbox slot="dropdown-content" .selected=${defaultModes.indexOf(this._defaultMode)}>
										${defaultModes.map((mode) => {
					return html` <paper-item>${mode}</paper-item> `;
				})}
									</paper-listbox>
								</paper-dropdown-menu>
								<paper-dropdown-menu
									label="${localize('main.fields.linkTarget')}"
									@value-changed=${this._valueChanged}
									.configValue=${'linkTarget'}
								>
									<paper-listbox slot="dropdown-content" .selected=${linkTargets.indexOf(this._linkTarget)}>
										${linkTargets.map((linkTarget) => {
					return html` <paper-item>${linkTarget}</paper-item> `;
				})}
									</paper-listbox> </paper-dropdown-menu
								><br />
								<div class="side-by-side">
									<div>
										<paper-input
											label="${localize('main.fields.cardHeight')}"
											.value=${this._cardHeight}
											.configValue=${'cardHeight'}
											@value-changed=${this._valueChanged}
										></paper-input>
									</div>
									<div>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											.checked=${this._showLoader !== false}
											.configValue=${'showLoader'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.showLoader')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showDate ? 'off' : 'on'}`}
											.checked=${this._showDate !== false}
											.configValue=${'showDate'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.showDate')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle Show Declined ${this._showDeclined ? 'off' : 'on'}`}
											.checked=${this._showDeclined !== false}
											.configValue=${'showDeclined'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.showDeclined')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._sortByStartTime ? 'off' : 'on'}`}
											.checked=${this._sortByStartTime !== false}
											.configValue=${'sortByStartTime'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.sortByStartTime')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._hideFinishedEvents ? 'on' : 'off'}`}
											.checked=${this._hideFinishedEvents !== false}
											.configValue=${'hideFinishedEvents'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.hideFinishedEvents')}</label>
									</div>
									<div>
										<ha-switch
											.checked=${this._showLocation !== false}
											.configValue=${'showLocation'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.showLocation')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showRelativeTime ? 'on' : 'off'}`}
											.checked=${this._showRelativeTime !== false}
											.configValue=${'showRelativeTime'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.showRelativeTime')}</label>
									</div>
									<div></div>
								</div>
							</div>
					  `
				: ''}
				<!-- MAIN SETTINGS END -->
				<!-- EVENT SETTINGS -->
				<div class="option" @click=${this._toggleOption} .option=${'event'}>
					<div class="row">
						<ha-icon .icon=${`mdi:${options.event.icon}`}></ha-icon>
						<div class="title">${localize('event.name')}</div>
					</div>
					<div class="secondary">${localize('event.secondary')}</div>
				</div>
				${options.event.show
				? html`
							<div class="values">
								<paper-input
									label="${localize('event.fields.untilText')}"
									type="text"
									.value=${this._untilText}
									.configValue=${'untilText'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<paper-input
									label="${localize('event.fields.fullDayEventText')}"
									type="text"
									.value=${this._fullDayEventText}
									.configValue=${'fullDayEventText'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<paper-input
									label="${localize('event.fields.noEventsForNextDaysText')}"
									type="text"
									.value=${this._noEventsForNextDaysText}
									.configValue=${'noEventsForNextDaysText'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<paper-input
									label="${localize('event.fields.noEventText')}"
									type="text"
									.value=${this._noEventText}
									.configValue=${'noEventText'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<paper-input
									label="${localize('event.fields.hiddenEventText')}"
									type="text"
									.value=${this._hiddenEventText}
									.configValue=${'hiddenEventText'}
									@value-changed=${this._valueChanged}
								></paper-input>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showCurrentEventLine ? 'off' : 'on'}`}
											.checked=${this._showCurrentEventLine !== false}
											.configValue=${'showCurrentEventLine'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showCurrentEventLine')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showProgressBar ? 'on' : 'off'}`}
											.checked=${this._showProgressBar !== false}
											.configValue=${'showProgressBar'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showProgressBar')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showMonth ? 'off' : 'on'}`}
											.checked=${this._showMonth !== false}
											.configValue=${'showMonth'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showMonth')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showWeekDay ? 'off' : 'on'}`}
											.checked=${this._showWeekDay !== false}
											.configValue=${'showWeekDay'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showWeekDay')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showDescription ? 'on' : 'off'}`}
											.checked=${this._showDescription !== false}
											.configValue=${'showDescription'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showDescription')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._disableEventLink ? 'off' : 'on'}`}
											.checked=${this._disableEventLink !== false}
											.configValue=${'disableEventLink'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.disableEventLink')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._disableLocationLink ? 'off' : 'on'}`}
											.checked=${this._disableLocationLink !== false}
											.configValue=${'disableLocationLink'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.disableLocationLink')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showNoEventsForToday ? 'off' : 'on'}`}
											.checked=${this._showNoEventsForToday !== false}
											.configValue=${'showNoEventsForToday'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showNoEventsForToday')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showFullDayProgress ? 'off' : 'on'}`}
											.checked=${this._showFullDayProgress !== false}
											.configValue=${'showFullDayProgress'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showFullDayProgress')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showEventIcon ? 'off' : 'on'}`}
											.checked=${this._showEventIcon !== false}
											.configValue=${'showEventIcon'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showEventIcon')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showHiddenText ? 'on' : 'off'}`}
											.checked=${this._showHiddenText !== false}
											.configValue=${'showHiddenText'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showHiddenText')}</label>
									</div>
									<div></div>
								</div>
							</div>
					  `
				: ''}
				<!-- EVENT SETTINGS END -->
				<!-- CALENDAR SETTINGS -->
				<div class="option" @click=${this._toggleOption} .option=${'calendar'}>
					<div class="row">
						<ha-icon .icon=${`mdi:${options.calendar.icon}`}></ha-icon>
						<div class="title">${localize('calendar.name')}</div>
					</div>
					<div class="secondary">${localize('calendar.secondary')}</div>
				</div>
				${options.calendar.show
				? html`
							<div class="values">
								<ha-switch
									aria-label=${`Toggle ${this._calShowDescription ? 'off' : 'on'}`}
									.checked=${this._calShowDescription !== false}
									.configValue=${'calShowDescription'}
									@change=${this._valueChanged}
								></ha-switch>
								<label class="mdc-label">${localize('calendar.fields.calShowDescription')}</label>
								<div calss="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showLastCalendarWeek ? 'off' : 'on'}`}
											.checked=${this._showLastCalendarWeek !== false}
											.configValue=${'showLastCalendarWeek'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('calendar.fields.showLastCalendarWeek')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._disableCalEventLink ? 'off' : 'on'}`}
											.checked=${this._disableCalEventLink !== false}
											.configValue=${'disableCalEventLink'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('calendar.fields.disableCalEventLink')}</label>
									</div>
								</div>
								<div calss="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._disableCalLocationLink ? 'off' : 'on'}`}
											.checked=${this._disableCalLocationLink !== false}
											.configValue=${'disableCalLocationLink'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('calendar.fields.disableCalLocationLink')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._disableCalLink ? 'off' : 'on'}`}
											.checked=${this._disableCalLink !== false}
											.configValue=${'disableCalLink'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('calendar.fields.disableCalLink')}</label>
									</div>
								</div>
							</div>
					  `
				: ''}
				<!-- CALENDAR SETTINGS END -->
				<!-- APPEARANCE SETTINGS -->
				<div class="option" @click=${this._toggleOption} .option=${'appearance'}>
					<div class="row">
						<ha-icon .icon=${`mdi:${options.appearance.icon}`}></ha-icon>
						<div class="title">${localize('appearance.name')}</div>
					</div>
					<div class="secondary">${localize('appearance.secondary')}</div>
				</div>
				${options.appearance.show
				? html`
							<div class="values">
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._dimFinishedEvents ? 'off' : 'on'}`}
											.checked=${this._dimFinishedEvents !== false}
											.configValue=${'dimFinishedEvents'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('appearance.fields.dimFinishedEvents')}</label>
									</div>
								</div>
							</div>
					  `
				: ''}
				<!-- APPEARANCE SETTINGS END -->
			</div>
		`;
	}

	private _toggleOption(ev): void {
		this._toggleThing(ev, options);
	}

	private _toggleThing(ev, optionList): void {
		const show = !optionList[ev.target.option].show;
		for (const [key] of Object.entries(optionList)) {
			optionList[key].show = false;
		}
		optionList[ev.target.option].show = show;
		this._toggle = !this._toggle;
	}

	private _valueChanged(ev): void {
		if (!this._config || !this.hass) {
			return;
		}
		const target = ev.target;
		if (this[`_${target.configValue}`] === target.value) {
			return;
		}
		if (target.configValue) {
			if (target.value === '') {
				delete this._config[target.configValue];
			} else {
				let value = target.value;
				if (target.type === 'number') {
					value = Number(value);
				}
				this._config = {
					...this._config,
					[target.configValue]: target.checked !== undefined ? target.checked : value,
				};
			}
		}

		fireEvent(this, 'config-changed', { config: this._config });
	}
}
