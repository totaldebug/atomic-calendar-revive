import { LitElement, html, TemplateResult, CSSResult } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';

import { localize } from './localize/localize';
import { style } from './style-editor';
import { atomicCardConfig } from './types';

const linkTargets: string[] = ['_blank', '_self', '_parent', '_top'];
const defaultModes: string[] = ['Event', 'Calendar'];

const options = {
	required: {
		icon: 'tune',
		show: false,
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
	@property({ attribute: false })
	public hass!: HomeAssistant;
	@state() private _config!: atomicCardConfig;
	@state() private _toggle?: boolean;
	@state() private _helpers?: any;
	private _initialized = false;

	static get styles(): CSSResult {
		return style;
	}

	public setConfig(config: atomicCardConfig): void {
		this._config = config;

		this.loadCardHelpers();
	}

	protected shouldUpdate(): boolean {
		if (!this._initialized) {
			this._initialize();
		}

		return true;
	}

	// ENTITY SETTINGS
	get _entityOptions() {
		const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'calendar');

		const entityOptions = entities.map(eid => {
			let matchingConfigEnitity = this._config?.entities.find(entity => (entity && entity.entity || entity) === eid);
			const originalEntity = this.hass.states[eid];

			if (matchingConfigEnitity === undefined) {

				matchingConfigEnitity = {
					entity: eid,
					name: (matchingConfigEnitity && matchingConfigEnitity.name) || originalEntity.attributes.friendly_name || eid,
					checked: !!matchingConfigEnitity
				}

			} else {
				if (!('name' in matchingConfigEnitity)) {
					matchingConfigEnitity = { ...matchingConfigEnitity, name: (matchingConfigEnitity && matchingConfigEnitity.name) || originalEntity.attributes.friendly_name || eid }
				}
				matchingConfigEnitity = { ...matchingConfigEnitity, checked: !!matchingConfigEnitity }

			}
			return matchingConfigEnitity
		});
		return entityOptions;
	}

	//MAIN SETTINGS
	get _name(): string {
		return this._config?.name || '';
	}

	get _firstDayOfWeek(): number {
		return this._config?.firstDayOfWeek || 1;
	}

	get _maxDaysToShow(): number {
		return this._config?.maxDaysToShow || 7;
	}

	get _linkTarget(): string {
		return this._config?.linkTarget || '_blank';
	}
	get _defaultMode(): string {
		return this._config?.defaultMode || 'Event';
	}
	get _cardHeight(): string {
		return this._config?.cardHeight || '100%';
	}

	get _showLocation(): boolean {
		return this._config?.showLocation || true;
	}
	get _showLoader(): boolean {
		return this._config?.showLoader || true;
	}
	get _sortByStartTime(): boolean {
		return this._config?.sortByStartTime || false;
	}
	get _showDeclined(): boolean {
		return this._config?.showDeclined || false;
	}
	get _hideDuplicates(): boolean {
		return this._config?.hideDuplicates || false;
	}
	get _showMultiDay(): boolean {
		return this._config?.showMultiDay || false;
	}
	get _showMultiDayEventParts(): boolean {
		return this._config?.showMultiDayEventParts || false;
	}

	get _dateFormat(): string {
		return this._config?.dateFormat || 'LL';
	}
	get _hoursFormat(): string {
		return this._config?.hoursFormat || '';
	}
	get _refreshInterval(): number {
		return this._config?.refreshInterval || 60;
	}
	get _showDate(): boolean {
		return this._config?.showDate || false;
	}
	get _showRelativeTime(): boolean {
		return this._config?.showRelativeTime || false;
	}
	// MAIN SETTINGS END

	// EVENT SETTINGS

	get _showCurrentEventLine(): boolean {
		return this._config?.showCurrentEventLine || false;
	}

	get _showProgressBar(): boolean {
		return this._config?.showProgressBar || true;

	}

	get _showMonth(): boolean {
		return this._config?.showMonth || false;
	}
	get _showWeekDay(): boolean {
		return this._config?.showWeekDay || false;
	}
	get _showDescription(): boolean {
		return this._config?.showDescription || true;
	}
	get _disableEventLink(): boolean {
		return this._config?.disableEventLink || false;
	}
	get _disableLocationLink(): boolean {
		return this._config?.disableLocationLink || false;
	}
	get _showNoEventsForToday(): boolean {
		return this._config?.showNoEventsForToday || false;
	}
	get _showCalNameInEvent(): boolean {
		return this._config?.showCalNameInEvent || false;
	}
	get _showFullDayProgress(): boolean {
		return this._config?.showFullDayProgress || false;
	}
	get _hideFinishedEvents(): boolean {
		return this._config?.hideFinishedEvents || false;
	}
	get _showEventIcon(): boolean {
		return this._config?.showEventIcon || false;
	}
	get _untilText(): string {
		return this._config?.untilText || '';
	}
	get _fullDayEventText(): string {
		return this._config?.fullDayEventText || '';
	}
	get _noEventsForNextDaysText(): string {
		return this._config?.noEventsForNextDaysText || '';
	}
	get _noEventText(): string {
		return this._config?.noEventText || '';
	}
	get _showHiddenText(): boolean {
		return this._config?.showHiddenText || false;
	}
	get _showCalendarName(): boolean {
		return this._config?.showCalendarName || false;
	}
	get _hiddenEventText(): string {
		return this._config?.hiddenEventText || '';
	}
	get _showWeekNumber(): boolean {
		return this._config?.showWeekNumber || false;
	}
	// EVENT SETTINGS END

	// CALENDAR SETTINGS
	get _showLastCalendarWeek(): boolean {
		return this._config?.showLastCalendarWeek || false;
	}
	get _disableCalEventLink(): boolean {
		return this._config?.disableCalEventLink || false;
	}
	get _disableCalLocationLink(): boolean {
		return this._config?.disableCalLocationLink || false;
	}
	get _calShowDescription(): boolean {
		return this._config?.calShowDescription || false;
	}

	get _disableCalLink(): boolean {
		return this._config?.disableCalLink || false;
	}

	// CALENDAR SETTINGS END

	// APPEARENCE SETTINGS

	get _locationLinkColor(): string {
		return this._config?.locationLinkColor || '';
	}
	get _dimFinishedEvents(): boolean {
		return this._config?.dimFinishedEvents || true;
	}

	// APPEARENCE SETTINGS END

	protected render(): TemplateResult | void {
		if (!this.hass || !this._helpers) {
			return html``;
		}

		// The climate more-info has ha-switch and paper-dropdown-menu elements that are lazy loaded unless explicitly done here
		this._helpers.importMoreInfoControl('climate');

		// You can restrict on domain type
		const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'calendar');

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
							<div class="entities">
							${this._entityOptions.map(entity => {
					return html`
								  <div>
								  	<ha-switch
										.checked=${entity.checked}
										.entityId=${entity.entity}
										@change="${this._entityChanged}"
									></ha-switch>
									<label class="mdc-label">${entity.entity}</label>
									${entity.checked ? html`
									<div class="side-by-side">
										<div>
											<paper-input
												label="Name"
												.value="${entity.name}"
												.configValue=${'name'}
												.entityId="${entity.entity}"
												@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
										<div>
											<paper-input
												label="Icon"
												.value="${entity.icon === undefined ? '' : entity.icon}"
												.configValue=${'icon'}
												.entityId="${entity.entity}"
												@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
									</div>
									<div class="side-by-side">
										<div>
											<paper-input
												label="startTimeFilter"
												.value="${entity.startTimeFilter === undefined ? '' : entity.startTimeFilter}"
												.configValue=${'startTimeFilter'}
												.entityId="${entity.entity}"
												@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
										<div>
											<paper-input
												label="endTimeFilter"
												.value="${entity.endTimeFilter === undefined ? '' : entity.endTimeFilter}"
												.configValue=${'endTimeFilter'}
												.entityId="${entity.entity}"
												@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
									</div>
									<div class="side-by-side">
										<div>
											<paper-input
											label="maxDaysToShow"
											.value="${entity.maxDaysToShow === undefined ? '' : entity.maxDaysToShow}"
											.configValue=${'maxDaysToShow'}
											.entityId="${entity.entity}"
											@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
										<div>
											<paper-input
											label="showMultiDay"
											.value="${entity.showMultiDay === undefined ? '' : entity.showMultiDay}"
											.configValue=${'showMultiDay'}
											.entityId="${entity.entity}"
											@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
									</div>
									<div class="side-by-side">
										<div>
											<paper-input
											label="blocklist"
											.value="${entity.blocklist === undefined ? '' : entity.blocklist}"
											.configValue=${'blocklist'}
											.entityId="${entity.entity}"
											@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
										<div>
											<paper-input
											label="blocklistLocation"
											.value="${entity.blocklistLocation === undefined ? '' : entity.blocklistLocation}"
											.configValue=${'blocklistLocation'}
											.entityId="${entity.entity}"
											@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
									</div>
									<div class="side-by-side">
										<div>
											<paper-input
											label="allowlist"
											.value="${entity.allowlist === undefined ? '' : entity.allowlist}"
											.configValue=${'allowlist'}
											.entityId="${entity.entity}"
											@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
										<div>
											<paper-input
											label="allowlistLocation"
											.value="${entity.allowlistLocation === undefined ? '' : entity.allowlistLocation}"
											.configValue=${'allowlistLocation'}
											.entityId="${entity.entity}"
											@value-changed="${this._entityValueChanged}"
											></paper-input>
										</div>
									</div>` : html``
						}

								  </div>
								`;
				})
					}
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
											aria-label=${`Toggle ${this._hideFinishedEvents ? 'off' : 'on'}`}
											.checked=${this._hideFinishedEvents !== false}
											.configValue=${'hideFinishedEvents'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.hideFinishedEvents')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showLocation ? 'on' : 'off'}`}
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
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._hideDuplicates ? 'on' : 'off'}`}
											.checked=${this._hideDuplicates !== false}
											.configValue=${'hideDuplicates'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.hideDuplicates')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showMultiDay ? 'on' : 'off'}`}
											.checked=${this._showMultiDay !== false}
											.configValue=${'showMultiDay'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.showMultiDay')}</label>
									</div>
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showMultiDayEventParts ? 'on' : 'off'}`}
											.checked=${this._showMultiDayEventParts !== false}
											.configValue=${'showMultiDayEventParts'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('main.fields.showMultiDayEventParts')}</label>
									</div>
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
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showCalendarName ? 'on' : 'off'}`}
											.checked=${this._showCalendarName !== false}
											.configValue=${'showCalendarName'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showCalendarName')}</label>
									</div>
								</div>
								<div class="side-by-side">
									<div>
										<ha-switch
											aria-label=${`Toggle ${this._showWeekNumber ? 'on' : 'off'}`}
											.checked=${this._showWeekNumber !== false}
											.configValue=${'showWeekNumber'}
											@change=${this._valueChanged}
										></ha-switch>
										<label class="mdc-label">${localize('event.fields.showWeekNumber')}</label>
									</div>
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
	private _initialize(): void {
		if (this.hass === undefined) return;
		if (this._config === undefined) return;
		if (this._helpers === undefined) return;
		this._initialized = true;
	}

	private async loadCardHelpers(): Promise<void> {
		this._helpers = await (window as any).loadCardHelpers();
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
		if (this.cantFireEvent) return;

		const target = ev.target;
		if (this[`_${target.configValue}`] === target.value) {
			return;
		}
		if (target.configValue) {
			if (target.value === '') {
				const tmpConfig = { ...this._config };
				delete tmpConfig[target.configValue];
				this._config = tmpConfig;
			} else {
				this._config = {
					...this._config,
					[target.configValue]: target.checked !== undefined ? target.checked : (isNaN(target.value)) ? target.value : parseInt(target.value),
				};
			}
		}
		fireEvent(this, 'config-changed', { config: this._config });
	}

	get entities() {
		const entities = [...(this._config.entities || [])];

		// convert any legacy entity strings into objects
		let entityObjects = entities.map(entity => {
			if (entity.entity) return entity;
			return { entity, name: entity };
		});

		return entityObjects;
	}
	/**
	  * change the calendar name of an entity
	  * @param {*} ev
	  */
	private _entityValueChanged(ev) {
		if (this.cantFireEvent) return;

		const target = ev.target
		let entityObjects = [...this.entities];

		entityObjects = entityObjects.map(entity => {
			if (entity.entity === target.entityId) {
				if (this[`_${target.configValue}`] === target.value) {
					return;
				}
				if (target.configValue && target.value === '') {
					delete entity[target.configValue];
					return entity;
				} else {
					entity = {
						...entity,
						[target.configValue]: target.checked !== undefined ? target.checked : (isNaN(target.value)) ? target.value : parseInt(target.value),
					}
				}
			}
			return entity;
		});

		this._config = Object.assign({}, this._config, { entities: entityObjects });
		fireEvent(this, 'config-changed', { config: this._config });
	}
	/**
	 * add or remove calendar entities from config
	 * @param {*} ev
	 */
	private _entityChanged(ev) {
		const target = ev.target;

		if (this.cantFireEvent) return;
		let entityObjects = [...this.entities];
		if (target.checked) {
			const originalEntity = this.hass.states[target.entityId];
			entityObjects.push({ entity: target.entityId, name: originalEntity.attributes.friendly_name || target.entityId });
		} else {
			entityObjects = entityObjects.filter(entity => entity.entity !== target.entityId);
		}

		this._config = Object.assign({}, this._config, { entities: entityObjects });
		fireEvent(this, 'config-changed', { config: this._config });
	}
	/**
	* stop events from firing if certains conditions not met
	*/
	get cantFireEvent() {
		return (!this._config || !this.hass);
	}
}
