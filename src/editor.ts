import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { CSSResult, LitElement, TemplateResult, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { fireEvent } from './common/fire-event';
import defaultConfig from './defaults';
import localize from './localize/localize';
import { style } from './style-editor';
import { atomicCardConfig } from './types/config';
import {
	DropdownProperty,
	NumberProperty,
	Option,
	Property,
	SwitchProperty,
	TextProperty,
	UnionProperty,
} from './types/editor';
import { HomeAssistant } from './types/homeassistant';
import { LovelaceCardEditor } from './types/lovelace';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { switchDefinition } from '../elements/switch';
import { textfieldDefinition } from '../elements/textfield';

@customElement('atomic-calendar-revive-editor')
export class AtomicCalendarReviveEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
	@property({ attribute: false }) public hass!: HomeAssistant;
	@state() private _config!: atomicCardConfig;
	@state() private _toggle?: boolean;
	@state() private _helpers?: unknown;
	@state() private options?: { [id: string]: Option };
	private _initialized = false;

	static elementDefinitions = {
		...textfieldDefinition,
		...formfieldDefinition,
		...switchDefinition,
		...selectDefinition,
	};

	static get styles(): CSSResult {
		return style;
	}

	public setConfig(config: atomicCardConfig): void {
		const customConfig: atomicCardConfig = JSON.parse(JSON.stringify(config));

		this._config = {
			...customConfig,
		};

		this.loadCardHelpers();
	}

	protected shouldUpdate(): boolean {
		if (!this._initialized) {
			this._initialize();
		}

		return true;
	}

	protected render(): TemplateResult | void {
		if (!this.hass || !this._helpers || !this.options) {
			return html``;
		}

		return html`
			<div class="card-config">
				<div class="sponsor">
					<div>
						Please consider sponsoring this project. <br />
						This will help keep the project alive and continue development.
					</div>
					<div class="badge">
						<a href="https://github.com/sponsors/marksie1988" target="_blank">
							<img
								src="https://img.shields.io/badge/sponsor-000?style=for-the-badge&logo=githubsponsors&logoColor=red"
							/>
						</a>
					</div>
				</div>
				${Object.entries(this.options).map((option) => this.renderOption(option[0], option[1]))}
			</div>
		`;
	}

	private renderOption(key: string, option: Option): TemplateResult | void {
		return html`
			<div class="option" @click=${this._toggleOption} .option=${key}>
				<div class="row">
					<span>
						<ha-icon icon="mdi:${option.icon}" class="icon" style="color: white;"></ha-icon>
					</span>
					<div class="title">${option.name}</div>
				</div>
				<div class="secondary">${option.description}</div>
			</div>

			${option.show
				? key === 'entities'
					? this.renderEntities()
					: html` <div class="values">${option.properties.map((property) => this.renderProperty(property))}</div>`
				: ''}
		`;
	}

	private renderProperty(property: UnionProperty): TemplateResult {
		if (property.type == 'text') {
			return this.renderTextProperty(property);
		}
		if (property.type == 'number') {
			return this.renderNumberProperty(property);
		}
		if (property.type == 'dropdown') {
			return this.renderDropdownProperty(property);
		}
		if (property.type == 'switch') {
			return this.renderSwitchProperty(property);
		}
		return html``;
	}

	private renderTextProperty(property: TextProperty): TemplateResult {
		return html`
			<br />
			<mwc-textfield
				class="mwc-text-field"
				label=${property.label}
				.value=${this.getPropertyValue(property) || property.default || ''}
				.configValue=${property.name}
				@input=${this._valueChanged}
			></mwc-textfield>
		`;
	}

	private renderNumberProperty(property: NumberProperty): TemplateResult {
		return html`
			<br />
			<mwc-textfield
				class="mwc-text-field"
				label=${property.label}
				type="number"
				.value=${this.getPropertyValue(property) || property.default}
				.configValue=${property.name}
				.number=${true}
				@input=${this._valueChanged}
				min=${property.min}
				max=${property.max}
			></mwc-textfield>
		`;
	}

	private renderSwitchProperty(property: SwitchProperty): TemplateResult {
		const checked = this.getPropertyValue(property);
		return html`
			<br />
			<mwc-switch
				.checked=${checked != undefined ? checked : property.default != undefined ? property.default : false}
				.configValue=${property.name}
				@change=${this._valueChanged}
			></mwc-switch>
			<label class="mdc-label">${property.label}</label>
		`;
	}

	private renderDropdownProperty(property: DropdownProperty): TemplateResult {
		return html`
			<br />
			<mwc-select
				naturalMenuWidth
				fixedMenuPosition
				label=${property.label}
				.configValue=${property.name}
				.value=${this.getPropertyValue(property) || property.default || ''}
				@selected=${this._valueChanged}
				@closed=${(ev) => ev.stopPropagation()}
			>
				${property.items.map((item) => {
					return html` <mwc-list-item .value=${item}>${item}</mwc-list-item> `;
				})}
			</mwc-select>
		`;
	}

	private getPropertyValue(property: Property): unknown {
		if (this._config == undefined) {
			return undefined;
		}
		const parent = property.section ? this._config[property.section] : this._config;
		if (parent == undefined) {
			return undefined;
		}
		return parent[property.name];
	}

	private _initialize(): void {
		if (this.hass === undefined) {
			return;
		}
		if (this._config === undefined) {
			return;
		}
		if (this._helpers === undefined) {
			return;
		}
		this._initialized = true;

		const linkTargets: string[] = ['_blank', '_self', '_parent', '_top'];
		const defaultModes: string[] = ['Event', 'Calendar'];
		const sortBy: string[] = ['start', 'milestone', 'none'];

		this.options = {
			entities: {
				icon: 'tune',
				name: localize('required.name'),
				description: localize('required.secondary'),
				show: false,
				properties: [],
			},
			main: {
				icon: 'eye-settings',
				name: localize('main.name'),
				description: localize('main.secondary'),
				show: false,
				properties: [
					{
						type: 'text',
						name: 'name',
						label: localize('main.fields.name'),
					},
					{
						type: 'number',
						name: 'titleLength',
						label: localize('main.fields.titleLength'),
						min: 0,
						max: 99999999999,
						default: defaultConfig.titleLength,
					},
					{
						type: 'number',
						name: 'descLength',
						label: localize('main.fields.descLength'),
						min: 0,
						max: 99999999999,
						default: defaultConfig.descLength,
					},
					{
						type: 'number',
						name: 'firstDayOfWeek',
						label: localize('main.fields.firstDayOfWeek'),
						min: 0,
						max: 6,
						default: defaultConfig.firstDayOfWeek,
					},
					{
						type: 'number',
						name: 'maxDaysToShow',
						label: localize('main.fields.maxDaysToShow'),
						min: 0,
						max: 99999999999,
						default: defaultConfig.maxDaysToShow,
					},
					{
						type: 'number',
						name: 'startDaysAhead',
						label: localize('main.fields.startDaysAhead'),
						min: 0,
						max: 999,
						default: defaultConfig.startDaysAhead,
					},
					{
						type: 'number',
						name: 'refreshInterval',
						label: localize('main.fields.refreshInterval'),
						min: 60,
						max: 99999999999,
						default: defaultConfig.refreshInterval,
					},
					{
						type: 'text',
						name: 'dateFormat',
						label: localize('main.fields.dateFormat'),
						default: defaultConfig.dateFormat,
					},
					{
						type: 'text',
						name: 'eventTitle',
						label: localize('main.fields.eventTitle'),
					},
					{
						type: 'dropdown',
						items: defaultModes,
						name: 'defaultMode',
						section: 'main',
						label: localize('main.fields.defaultMode'),
						selected: defaultModes.indexOf(this._config.defaultMode || defaultConfig.defaultMode),
					},
					{
						type: 'dropdown',
						items: linkTargets,
						name: 'linkTarget',
						section: 'main',
						label: localize('main.fields.linkTarget'),
						selected: linkTargets.indexOf(this._config.linkTarget || defaultConfig.linkTarget),
					},
					{
						type: 'dropdown',
						items: sortBy,
						name: 'sortBy',
						section: 'main',
						label: localize('main.fields.sortBy'),
						selected: sortBy.indexOf(this._config.sortBy || defaultConfig.sortBy),
					},
					{
						type: 'text',
						name: 'cardHeight',
						label: localize('main.fields.cardHeight'),
						default: defaultConfig.cardHeight,
					},
					{
						type: 'switch',
						name: 'showLoader',
						label: localize('main.fields.showLoader'),
						default: defaultConfig.showLoader,
					},
					{
						type: 'switch',
						name: 'showDate',
						label: localize('main.fields.showDate'),
						default: defaultConfig.showDate,
					},
					{
						type: 'switch',
						name: 'showDeclined',
						label: localize('main.fields.showDeclined'),
					},
					{
						type: 'switch',
						name: 'hideFinishedEvents',
						label: localize('main.fields.hideFinishedEvents'),
						default: defaultConfig.hideFinishedEvents,
					},
					{
						type: 'switch',
						name: 'showLocation',
						label: localize('main.fields.showLocation'),
						default: defaultConfig.showLocation,
					},
					{
						type: 'switch',
						name: 'showRelativeTime',
						label: localize('main.fields.showRelativeTime'),
						default: defaultConfig.showRelativeTime,
					},
					{
						type: 'switch',
						name: 'hideDuplicates',
						label: localize('main.fields.hideDuplicates'),
						default: defaultConfig.hideDuplicates,
					},
					{
						type: 'switch',
						name: 'showMultiDay',
						label: localize('main.fields.showMultiDay'),
						default: defaultConfig.showMultiDay,
					},
					{
						type: 'switch',
						name: 'showMultiDayEventParts',
						label: localize('main.fields.showMultiDayEventParts'),
						default: defaultConfig.showMultiDayEventParts,
					},
					{
						type: 'switch',
						name: 'compactMode',
						label: localize('main.fields.compactMode'),
					},
					{
						type: 'switch',
						name: 'showAllDayEvents',
						label: localize('main.fields.showAllDayEvents'),
						default: defaultConfig.showAllDayEvents,
					},
					{
						type: 'switch',
						name: 'offsetHeaderDate',
						label: localize('main.fields.offsetHeaderDate'),
						default: defaultConfig.offsetHeaderDate,
					},
					{
						type: 'switch',
						name: 'allDayBottom',
						label: localize('main.fields.allDayBottom'),
						default: defaultConfig.allDayBottom,
					},
				],
			},
			event: {
				icon: 'calendar-check',
				name: localize('event.name'),
				description: localize('event.secondary'),
				show: false,
				properties: [
					{
						type: 'text',
						name: 'untilText',
						label: localize('event.fields.untilText'),
					},
					{
						type: 'text',
						name: 'noEventsForNextDaysText',
						label: localize('event.fields.noEventsForNextDaysText'),
					},
					{
						type: 'text',
						name: 'noEventText',
						label: localize('event.fields.noEventText'),
					},
					{
						type: 'text',
						name: 'hiddenEventText',
						label: localize('event.fields.hiddenEventText'),
					},
					{
						type: 'switch',
						name: 'showCurrentEventLine',
						label: localize('event.fields.showCurrentEventLine'),
						default: defaultConfig.showCurrentEventLine,
					},
					{
						type: 'switch',
						name: 'showProgressBar',
						label: localize('event.fields.showProgressBar'),
						default: defaultConfig.showProgressBar,
					},
					{
						type: 'switch',
						name: 'showMonth',
						label: localize('event.fields.showMonth'),
						default: defaultConfig.showMonth,
					},
					{
						type: 'switch',
						name: 'showWeekDay',
						label: localize('event.fields.showWeekDay'),
						default: defaultConfig.showWeekDay,
					},
					{
						type: 'switch',
						name: 'showDescription',
						label: localize('event.fields.showDescription'),
						default: defaultConfig.showDescription,
					},
					{
						type: 'switch',
						name: 'disableEventLink',
						label: localize('event.fields.disableEventLink'),
						default: defaultConfig.disableEventLink,
					},
					{
						type: 'switch',
						name: 'disableLocationLink',
						label: localize('event.fields.disableLocationLink'),
						default: defaultConfig.disableLocationLink,
					},
					{
						type: 'switch',
						name: 'showNoEventsForToday',
						label: localize('event.fields.showNoEventsForToday'),
						default: defaultConfig.showNoEventsForToday,
					},
					{
						type: 'switch',
						name: 'showFullDayProgress',
						label: localize('event.fields.showFullDayProgress'),
						default: defaultConfig.showFullDayProgress,
					},
					{
						type: 'switch',
						name: 'showEventIcon',
						label: localize('event.fields.showEventIcon'),
						default: defaultConfig.showEventIcon,
					},
					{
						type: 'switch',
						name: 'showHiddenText',
						label: localize('event.fields.showHiddenText'),
						default: defaultConfig.showHiddenText,
					},
					{
						type: 'switch',
						name: 'showCalendarName',
						label: localize('event.fields.showCalendarName'),
						default: defaultConfig.showCalendarName,
					},
					{
						type: 'switch',
						name: 'showWeekNumber',
						label: localize('event.fields.showWeekNumber'),
						default: defaultConfig.showWeekNumber,
					},
					{
						type: 'switch',
						name: 'showEventDate',
						label: localize('event.fields.showEventDate'),
						default: defaultConfig.showEventDate,
					},
					{
						type: 'switch',
						name: 'showDatePerEvent',
						label: localize('event.fields.showDatePerEvent'),
						default: defaultConfig.showDatePerEvent,
					},
					{
						type: 'switch',
						name: 'showTimeRemaining',
						label: localize('event.fields.showTimeRemaining'),
					},
					{
						type: 'switch',
						name: 'showAllDayHours',
						label: localize('event.fields.showAllDayHours'),
						default: defaultConfig.showAllDayHours,
					},
					{
						type: 'switch',
						name: 'hoursOnSameLine',
						label: localize('event.fields.hoursOnSameLine'),
					},
				],
			},
			calendar: {
				icon: 'calendar-month-outline',
				name: localize('calendar.name'),
				description: localize('calendar.secondary'),
				show: false,
				properties: [
					{
						type: 'switch',
						name: 'calShowDescription',
						label: localize('calendar.fields.calShowDescription'),
					},
					{
						type: 'switch',
						name: 'showLastCalendarWeek',
						label: localize('calendar.fields.showLastCalendarWeek'),
						default: defaultConfig.showLastCalendarWeek,
					},
					{
						type: 'switch',
						name: 'disableCalEventLink',
						label: localize('calendar.fields.disableCalEventLink'),
					},
					{
						type: 'switch',
						name: 'disableCalLocationLink',
						label: localize('calendar.fields.disableCalLocationLink'),
					},
					{
						type: 'switch',
						name: 'disableCalLink',
						label: localize('calendar.fields.disableCalLink'),
					},
				],
			},
			appearance: {
				icon: 'palette',
				name: localize('appearance.name'),
				description: localize('appearance.secondary'),
				show: false,
				properties: [
					{
						type: 'switch',
						name: 'dimFinishedEvents',
						label: localize('appearance.fields.dimFinishedEvents'),
						default: defaultConfig.dimFinishedEvents,
					},
				],
			},
		};
	}

	private async loadCardHelpers(): Promise<void> {
		this._helpers = await (window as any).loadCardHelpers();
	}

	private _toggleOption(ev): void {
		if (this.options == undefined) {
			return undefined;
		}

		const show = !this.options[ev.target.option].show;
		for (const [key] of Object.entries(this.options)) {
			this.options[key].show = false;
		}
		this.options[ev.target.option].show = show;
		this._toggle = !this._toggle;
	}

	private _valueChanged(ev): void {
		if (!this._config || !this.hass) {
			return;
		}
		const { target } = ev;
		const section = target.configSection;
		const config = { ...this._config };
		const parent = (section ? { ...config[section] } : config) || {};

		if (target.configValue) {
			if ((target.value === undefined && target.checked === undefined) || target.value === '') {
				delete parent[target.configValue];
				if (section) {
					this._config = { ...config, [section]: parent };
				} else {
					this._config = { ...parent };
				}
			} else {
				const key = target.configValue;
				const rawValue = target.checked !== undefined ? target.checked : target.value;
				const value = target.number ? parseFloat(rawValue) : rawValue;

				if (section) {
					this._config = {
						...config,
						[section]: { ...config[section], [key]: value },
					};
				} else {
					this._config = {
						...config,
						[key]: value,
					};
				}
			}
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		fireEvent(this, 'config-changed', { config: this._config });
	}

	/* TEMPORARY ENTITIES CODE, Needs reworking */
	// ENTITY SETTINGS
	get _entityOptions() {
		const entities = Object.keys(this.hass.states).filter((eid) => eid.substr(0, eid.indexOf('.')) === 'calendar');
		let entityOptions;
		if (this._config?.entities != 'undefined' || this._config?.entities != 'null') {
			entityOptions = entities.map((eid) => {
				let matchingConfigEnitity = this._config?.entities.find(
					(entity) => ((entity && entity.entity) || entity) === eid,
				);
				const originalEntity = this.hass.states[eid];
				if (matchingConfigEnitity === undefined) {
					matchingConfigEnitity = {
						entity: eid,
						name: originalEntity.attributes.friendly_name || eid,
						entityChecked: !!matchingConfigEnitity,
					};
				} else {
					if (!('name' in matchingConfigEnitity)) {
						matchingConfigEnitity = {
							...matchingConfigEnitity,
							name:
								(matchingConfigEnitity && matchingConfigEnitity.name) || originalEntity.attributes.friendly_name || eid,
						};
					}
					matchingConfigEnitity = { ...matchingConfigEnitity, entityChecked: !!matchingConfigEnitity };
				}
				return matchingConfigEnitity;
			});
		} else {
			entityOptions = entities.map((eid) => {
				const originalEntity = this.hass.states[eid];
				return {
					entity: eid,
					name: originalEntity.attributes.friendly_name || eid,
					entityChecked: false,
				};
			});
		}
		return entityOptions;
	}
	private renderEntities(): TemplateResult | void {
		return html`<div class="values">
			${this._entityOptions.map((entity) => {
				return html`
					<div class="entity-box">
						<mwc-switch
							.checked=${entity.entityChecked}
							.entityId=${entity.entity}
							@change="${this._entityChanged}"
						></mwc-switch>
						<label class="mdc-label">${entity.entity}</label>
						${entity.entityChecked
							? html` <div class="entity-options">
									<div class="side-by-side">
										<div>
											<mwc-textfield
												label="Name"
												.value="${entity.name}"
												.configValue=${'name'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
										<div>
											<mwc-textfield
												label="Icon"
												.value="${entity.icon === undefined ? '' : entity.icon}"
												.configValue=${'icon'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
									</div>
									<div class="side-by-side">
										<div>
											<mwc-textfield
												label="startTimeFilter"
												.value="${entity.startTimeFilter === undefined ? '' : entity.startTimeFilter}"
												.configValue=${'startTimeFilter'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
										<div>
											<mwc-textfield
												label="endTimeFilter"
												.value="${entity.endTimeFilter === undefined ? '' : entity.endTimeFilter}"
												.configValue=${'endTimeFilter'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
									</div>
									<div class="side-by-side">
										<div>
											<mwc-textfield
												label="maxDaysToShow"
												.value="${entity.maxDaysToShow === undefined ? '' : entity.maxDaysToShow}"
												.configValue=${'maxDaysToShow'}
												.entityId="${entity.entity}"
												type="number"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
										<div></div>
									</div>
									<div class="side-by-side">
										<div>
											<mwc-textfield
												label="blocklist"
												.value="${entity.blocklist === undefined ? '' : entity.blocklist}"
												.configValue=${'blocklist'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
										<div>
											<mwc-textfield
												label="blocklistLocation"
												.value="${entity.blocklistLocation === undefined ? '' : entity.blocklistLocation}"
												.configValue=${'blocklistLocation'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
									</div>
									<div class="side-by-side">
										<div>
											<mwc-textfield
												label="allowlist"
												.value="${entity.allowlist === undefined ? '' : entity.allowlist}"
												.configValue=${'allowlist'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
										<div>
											<mwc-textfield
												label="allowlistLocation"
												.value="${entity.allowlistLocation === undefined ? '' : entity.allowlistLocation}"
												.configValue=${'allowlistLocation'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
									</div>
									<div class="side-by-side">
										<div>
											<mwc-textfield
												label="eventTitle"
												.value="${entity.eventTitle === undefined ? '' : entity.eventTitle}"
												.configValue=${'eventTitle'}
												.entityId="${entity.entity}"
												@input="${this._entityValueChanged}"
											></mwc-textfield>
										</div>
										<div></div>
									</div>
									<div class="side-by-side">
										<div>
											<mwc-switch
												.checked=${entity.showMultiDay !== false}
												.configValue=${'showMultiDay'}
												.entityId="${entity.entity}"
												@change=${this._entityValueChanged}
											></mwc-switch>
											<label class="mdc-label">showMultiDay</label>
										</div>
									</div>
								</div>`
							: html``}
					</div>
				`;
			})}
		</div> `;
	}

	get entities() {
		const entities = [...(this._config.entities || [])];

		// convert any legacy entity strings into objects
		return entities.map((entity) => {
			if (entity.entity) {
				return entity;
			}
			return { entity, name: entity };
		});
	}
	/**
	 * change the entity configuration
	 * @param {*} ev
	 */
	private _entityValueChanged(ev) {
		if (this.cantFireEvent) {
			return;
		}

		const { target } = ev;
		let entityObjects = [...this.entities];
		entityObjects = entityObjects.map((entity) => {
			if (entity.entity === target.entityId && target.configValue) {
				if ((target.value === undefined && target.checked === undefined) || target.value === '') {
					delete entity[target.configValue];
					return entity;
				} else {
					const key = target.configValue;
					const rawValue =
						target.checked !== undefined ? target.checked : isNaN(target.value) ? target.value : parseInt(target.value);
					const value = target.number ? parseFloat(rawValue) : rawValue;

					entity = {
						...entity,
						[key]: value,
					};
				}
			}
			return entity;
		});

		this._config = Object.assign({}, this._config, { entities: entityObjects });
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		fireEvent(this, 'config-changed', { config: this._config });
	}
	/**
	 * add or remove calendar entities from config
	 * @param {*} ev
	 */
	private _entityChanged(ev) {
		const { target } = ev;

		if (this.cantFireEvent) {
			return;
		}
		let entityObjects = [...this.entities];
		if (target.checked) {
			const originalEntity = this.hass.states[target.entityId];
			entityObjects.push({ entity: target.entityId, name: originalEntity.attributes.friendly_name || target.entityId });
		} else {
			entityObjects = entityObjects.filter((entity) => entity.entity !== target.entityId);
		}

		this._config = Object.assign({}, this._config, { entities: entityObjects });
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		fireEvent(this, 'config-changed', { config: this._config });
	}
	/**
	 * stop events from firing if certains conditions not met
	 */
	get cantFireEvent() {
		return !this._config || !this.hass;
	}
}
