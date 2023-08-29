import { fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import {
    css,
    CSSResult,
    html,
    LitElement,
    TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin'


import { atomicCardConfig } from './types/config';
import {
    DropdownProperty,
    InputProperty,
    NumberProperty,
    Option,
    Property,
    SwitchProperty,
    UnionProperty,
} from './types/editor';
import { localize } from './localize/localize';

import { formfieldDefinition } from '../elements/formfield';
import { textfieldDefinition } from '../elements/textfield';
import { switchDefinition } from '../elements/switch';
import { selectDefinition } from '../elements/select';
import { style } from './style-editor';

@customElement('atomic-calendar-revive-editor')
export class AtomicCalendarReviveEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private _config!: atomicCardConfig;
    @state() private _toggle?: boolean;
    @state() private _helpers?: any;
    @state() private options?: { [id: string]: Option };
    private _initialized = false;

    static elementDefinitions = {
        ...textfieldDefinition,
        ...formfieldDefinition,
        ...switchDefinition,
        ...selectDefinition,
    };

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

    protected render(): TemplateResult {
        if (!this.hass || !this._helpers || !this.options) {
            return html``;
        }

        this._helpers.importMoreInfoControl('climate');

        return html`
      <div class="card-config">
        ${Object.entries(this.options).map(option => this.renderOption(option[0], option[1]))}
      </div>
    `;
    }

    private renderOption(key: string, option: Option): TemplateResult {
        return html`
      <div class="option" @click=${this._toggleOption} .option=${key}>
        <div class="row">
          <ha-icon .icon=${`mdi:${option.icon}`}></ha-icon>
          <div class="title">${option.name}</div>
        </div>
        <div class="secondary">${option.description}</div>
      </div>

      ${option.show
                ? html`
            <div class="values">
              ${option.properties.map(property => this.renderProperty(property))}
            </div>
          `
                : ''}
    `;
    }

    private renderProperty(property: UnionProperty): TemplateResult {
        if (property.type == 'input') {
            return this.renderInputProperty(property);
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

    private renderInputProperty(property: InputProperty): TemplateResult {
        return html`
      <mwc-textfield
		label=${property.label}
        placeholder=${property.default || ''}
		.value="${this.getPropertyValue(property)}
		.configValue=${property.name}
        .configSection=${property.section}
		@input=${this._valueChanged}
	  ></mwc-textfield>
    `;
    }

    private renderNumberProperty(property: NumberProperty): TemplateResult {
        return html`
      <mwc-textfield
		label=${property.label}
        placeholder=${property.default || ''}
		type="number"
	    .value=${this.getPropertyValue(property)}
		.configValue=${property.name}
        .configSection=${property.section}
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
          .configSection=${property.section}
		@change=${this._valueChanged}
	  ></mwc-switch>
	  <label class="mdc-label">${property.label}</label>
    `;
    }

    private renderDropdownProperty(property: DropdownProperty): TemplateResult {
        return html`
      <mwc-select
		naturalMenuWidth
		fixedMenuPosition
		label=${property.label}
		.configValue=${property.name}
        .configSection=${property.section}
		.value=${this.getPropertyValue(property) || property.default || ''}
		@selected=${this._valueChanged}
		@closed=${(ev) => ev.stopPropagation()}
	  >
        ${property.items.map(item => {
            return html`
            <mwc-list-item .value=${item}>${item}</mwc-list-item>
            `;
        })}
	  </mwc-select>
    `;
    }

    private getPropertyValue(property: Property): any {
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

        this.options = {
            main: {
                icon: 'eye-settings',
                name: localize('main.name'),
                description: localize('main.secondary'),
                show: false,
                properties: [
                    {
                        type: 'input',
                        name: 'name',
                        label: localize('main.fields.name'),
                    },
                    {
                        type: 'number',
                        name: 'titleLength',
                        label: localize('main.fields.titleLength'),
                        min: 0,
                        max: 99999999999,
                    },
                    {
                        type: 'number',
                        name: 'descLength',
                        label: localize('main.fields.descLength'),
                        min: 0,
                        max: 99999999999,
                    },
                    {
                        type: 'number',
                        name: 'firstDayOfWeek',
                        label: localize('main.fields.firstDayOfWeek'),
                        min: 0,
                        max: 6
                    },
                    {
                        type: 'number',
                        name: 'maxDaysToShow',
                        label: localize('main.fields.maxDaysToShow'),
                        min: 0,
                        max: 99999999999,
                    },
                    {
                        type: 'number',
                        name: 'refreshInterval',
                        label: localize('main.fields.refreshInterval'),
                        min: 60,
                        max: 99999999999,
                    },
                    {
                        type: 'input',
                        name: 'dateFormat',
                        label: localize('main.fields.dateFormat')
                    },
                    {
                        type: 'input',
                        name: 'hoursFormat',
                        label: localize('main.fields.hoursFormat'),
                    },
                    {
                        type: 'input',
                        name: 'eventTitle',
                        label: localize('main.fields.eventTitle'),
                    },
                    {
                        type: 'dropdown',
                        items: defaultModes,
                        name: 'defaultMode',
                        section: 'main',
                        label: localize('main.fields.defaultMode'),
                        selected: defaultModes.indexOf(this._config.defaultMode),
                    },
                    {
                        type: 'dropdown',
                        items: linkTargets,
                        name: 'linkTarget',
                        section: 'main',
                        label: localize('main.fields.linkTarget'),
                        selected: defaultModes.indexOf(this._config.linkTarget),
                    },
                    {
                        type: 'input',
                        name: 'cardHeight',
                        label: localize('main.fields.cardHeight'),
                    },
                    {
                        type: 'switch',
                        name: 'showLoader',
                        label: localize('main.fields.showLoader'),
                        default: this._config.showLoader,
                    },
                    {
                        type: 'switch',
                        name: 'showDate',
                        label: localize('main.fields.showDate'),
                        default: this._config.showDate,
                    },
                    {
                        type: 'switch',
                        name: 'showDeclined',
                        label: localize('main.fields.showDeclined'),
                        default: this._config.showDeclined,
                    },
                    {
                        type: 'switch',
                        name: 'sortByStartTime',
                        label: localize('main.fields.sortByStartTime'),
                        default: this._config.sortByStartTime,
                    },
                    {
                        type: 'switch',
                        name: 'hideFinishedEvents',
                        label: localize('main.fields.hideFinishedEvents'),
                        default: this._config.hideFinishedEvents,
                    },
                    {
                        type: 'switch',
                        name: 'showLocation',
                        label: localize('main.fields.showLocation'),
                        default: this._config.showLocation,
                    },
                    {
                        type: 'switch',
                        name: 'showRelativeTime',
                        label: localize('main.fields.showRelativeTime'),
                        default: this._config.showRelativeTime,
                    },
                    {
                        type: 'switch',
                        name: 'hideDuplicates',
                        label: localize('main.fields.hideDuplicates'),
                        default: this._config.hideDuplicates,
                    },
                    {
                        type: 'switch',
                        name: 'showMultiDay',
                        label: localize('main.fields.showMultiDay'),
                        default: this._config.showMultiDay,
                    },
                    {
                        type: 'switch',
                        name: 'showMultiDayEventParts',
                        label: localize('main.fields.showMultiDayEventParts'),
                        default: this._config.showMultiDayEventParts,
                    },
                    {
                        type: 'switch',
                        name: 'compactMode',
                        label: localize('main.fields.compactMode'),
                        default: this._config.compactMode,
                    },
                    {
                        type: 'switch',
                        name: 'hoursOnSameLine',
                        label: localize('main.fields.hoursOnSameLine'),
                        default: this._config.hoursOnSameLine,
                    },
                    {
                        type: 'switch',
                        name: 'showAllDayEvents',
                        label: localize('main.fields.showAllDayEvents'),
                        default: this._config.showAllDayEvents,
                    },
                    {
                        type: 'switch',
                        name: 'offsetHeaderDate',
                        label: localize('main.fields.offsetHeaderDate'),
                        default: this._config.offsetHeaderDate,
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
                        type: 'input',
                        name: 'untilText',
                        label: localize('event.fields.untilText'),
                    },
                    {
                        type: 'input',
                        name: 'noEventsForNextDaysText',
                        label: localize('event.fields.noEventsForNextDaysText'),
                    },
                    {
                        type: 'input',
                        name: 'noEventText',
                        label: localize('event.fields.noEventText'),
                    },
                    {
                        type: 'input',
                        name: 'hiddenEventText',
                        label: localize('event.fields.hiddenEventText'),
                    },
                    {
                        type: 'switch',
                        name: 'showCurrentEventLine',
                        label: localize('event.fields.showCurrentEventLine'),
                        default: this._config.showCurrentEventLine,
                    },
                    {
                        type: 'switch',
                        name: 'showProgressBar',
                        label: localize('event.fields.showProgressBar'),
                        default: this._config.showProgressBar,
                    },
                    {
                        type: 'switch',
                        name: 'showMonth',
                        label: localize('event.fields.showMonth'),
                        default: this._config.showMonth,
                    },
                    {
                        type: 'switch',
                        name: 'showWeekDay',
                        label: localize('event.fields.showWeekDay'),
                        default: this._config.showWeekDay,
                    },
                    {
                        type: 'switch',
                        name: 'showDescription',
                        label: localize('event.fields.showDescription'),
                        default: this._config.showDescription,
                    },
                    {
                        type: 'switch',
                        name: 'disableEventLink',
                        label: localize('event.fields.disableEventLink'),
                        default: this._config.disableEventLink,
                    },
                    {
                        type: 'switch',
                        name: 'disableLocationLink',
                        label: localize('event.fields.disableLocationLink'),
                        default: this._config.disableLocationLink,
                    },
                    {
                        type: 'switch',
                        name: 'showNoEventsForToday',
                        label: localize('event.fields.showNoEventsForToday'),
                        default: this._config.showNoEventsForToday,
                    },
                    {
                        type: 'switch',
                        name: 'showFullDayProgress',
                        label: localize('event.fields.showFullDayProgress'),
                        default: this._config.showFullDayProgress,
                    },
                    {
                        type: 'switch',
                        name: 'showEventIcon',
                        label: localize('event.fields.showEventIcon'),
                        default: this._config.showEventIcon,
                    },
                    {
                        type: 'switch',
                        name: 'showHiddenText',
                        label: localize('event.fields.showHiddenText'),
                        default: this._config.showHiddenText,
                    },
                    {
                        type: 'switch',
                        name: 'showCalendarName',
                        label: localize('event.fields.showCalendarName'),
                        default: this._config.showCalendarName,
                    },
                    {
                        type: 'switch',
                        name: 'showWeekNumber',
                        label: localize('event.fields.showWeekNumber'),
                        default: this._config.showWeekNumber,
                    },
                    {
                        type: 'switch',
                        name: 'showEventDate',
                        label: localize('event.fields.showEventDate'),
                        default: this._config.showEventDate,
                    },
                    {
                        type: 'switch',
                        name: 'showDatePerEvent',
                        label: localize('event.fields.showDatePerEvent'),
                        default: this._config.showDatePerEvent,
                    },
                    {
                        type: 'switch',
                        name: 'showTimeRemaining',
                        label: localize('event.fields.showTimeRemaining'),
                        default: this._config.showTimeRemaining,
                    },
                    {
                        type: 'switch',
                        name: 'showAllDayHours',
                        label: localize('event.fields.showAllDayHours'),
                        default: this._config.showAllDayHours,
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
                        default: this._config.calShowDescription,
                    },
                    {
                        type: 'switch',
                        name: 'showLastCalendarWeek',
                        label: localize('calendar.fields.showLastCalendarWeek'),
                        default: this._config.showLastCalendarWeek,
                    },
                    {
                        type: 'switch',
                        name: 'disableCalEventLink',
                        label: localize('calendar.fields.disableCalEventLink'),
                        default: this._config.disableCalEventLink,
                    },
                    {
                        type: 'switch',
                        name: 'disableCalLocationLink',
                        label: localize('calendar.fields.disableCalLocationLink'),
                        default: this._config.disableCalLocationLink,
                    },
                    {
                        type: 'switch',
                        name: 'disableCalLink',
                        label: localize('calendar.fields.disableCalLink'),
                        default: this._config.disableCalLink,
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
                        default: this._config.dimFinishedEvents,
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
        fireEvent(this, 'config-changed', { config: this._config });
    }

    static get styles(): CSSResult {
        return style;
    }
}
