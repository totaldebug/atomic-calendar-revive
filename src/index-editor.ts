import { LitElement, html, customElement, TemplateResult, CSSResult, property } from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';
import { localize } from './localize/localize';
import { style } from './style-editor';
import { atomicCardConfig } from './types';
import { EDITOR_VERSION } from './const';

const options = {
	required: {
		icon: 'tune',
		show: true
	},
	main: {
		icon: 'eye-settings',
		show: false
	},
	event: {
		icon: 'calendar-check',
		show: false
	},
	calendar: {
		icon: 'calendar-month-outline',
		show: false
	},
	appearance: {
		icon: 'palette',
		show: false,
		options: {
			tap: {
				icon: '',
				show: false
			}

		}
	}

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

	get _name(): string {
		if (this._config) {
			return this._config.name || '';
		}

		return '';
	}

	get _entity(): string {
		if (this._config) {
			return this._config.entity || '';
		}

		return '';
	}

	get _showColors(): boolean {
		if (this._config) {
			return this._config.showColors || true;
		}

		return false;
	}

	get _show_warning(): boolean {
		if (this._config) {
			return this._config.show_warning || false;
		}

		return false;
	}

	get _show_error(): boolean {
		if (this._config) {
			return this._config.show_error || false;
		}

		return false;
	}

	get _tap_action(): ActionConfig {
		if (this._config) {
			return this._config.tap_action || { action: 'more-info' };
		}

		return { action: 'more-info' };
	}

	get _hold_action(): ActionConfig {
		if (this._config) {
			return this._config.hold_action || { action: 'none' };
		}

		return { action: 'none' };
	}

	get _double_tap_action(): ActionConfig {
		if (this._config) {
			return this._config.double_tap_action || { action: 'none' };
		}

		return { action: 'none' };
	}

	protected render(): TemplateResult | void {
		if (!this.hass) {
			return html``;
		}

		// You can restrict on domain type
		const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'sun');

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
                <paper-dropdown-menu
                  label="Entity (Required)"
                  @value-changed=${this._valueChanged}
                  .configValue=${'entity'}
                >
                  <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._entity)}>
                    ${entities.map(entity => {
					return html`
                        <paper-item>${entity}</paper-item>
                      `;
				})}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
            `
				: ''}
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
								<br />
                <ha-switch
                  aria-label=${`Toggle colors ${this._showColors ? 'on' : 'off'}`}
                  .checked=${this._showColors !== false}
                  .configValue=${'showColors'}
                  @change=${this._valueChanged}
                  >${localize('main.fields.showColors')}?</ha-switch
                >
                <ha-switch
                  aria-label=${`Toggle error ${this._show_error ? 'off' : 'on'}`}
                  .checked=${this._show_error !== false}
                  .configValue=${'show_error'}
                  @change=${this._valueChanged}
                  >Show Error?</ha-switch
                >
              </div>
            `
				: ''}
        <div class="option" @click=${this._toggleOption} .option=${'calendar'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.calendar.icon}`}></ha-icon>
            <div class="title">${localize('calendar.name')}</div>
          </div>
          <div class="secondary">${localize('calendar.secondary')}</div>
        </div>
        ${options.calendar.show
				? html`
                <ha-switch
                  aria-label=${`Toggle warning ${this._show_warning ? 'off' : 'on'}`}
                  .checked=${this._show_warning !== false}
                  .configValue=${'show_warning'}
                  @change=${this._valueChanged}
                  >Show Warning?</ha-switch
                >
                <ha-switch
                  aria-label=${`Toggle error ${this._show_error ? 'off' : 'on'}`}
                  .checked=${this._show_error !== false}
                  .configValue=${'show_error'}
                  @change=${this._valueChanged}
                  >Show Error?</ha-switch
                >
              </div>
            `
				: ''}
        <div class="option" @click=${this._toggleOption} .option=${'appearance'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.appearance.icon}`}></ha-icon>
            <div class="title">${localize('appearance.name')}</div>
          </div>
          <div class="secondary">${localize('appearance.secondary')}</div>
        </div>
        ${options.appearance.show
				? html`
                <ha-switch
                  aria-label=${`Toggle warning ${this._show_warning ? 'off' : 'on'}`}
                  .checked=${this._show_warning !== false}
                  .configValue=${'show_warning'}
                  @change=${this._valueChanged}
                  >Show Warning?</ha-switch
                >
                <ha-switch
                  aria-label=${`Toggle error ${this._show_error ? 'off' : 'on'}`}
                  .checked=${this._show_error !== false}
                  .configValue=${'show_error'}
                  @change=${this._valueChanged}
                  >Show Error?</ha-switch
                >
              </div>
            `
				: ''}
      </div>
    `;
	}

	private _toggleAppearance(ev): void {
		this._toggleThing(ev, options.appearance.options);
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
				this._config = {
					...this._config,
					[target.configValue]: target.checked !== undefined ? target.checked : target.value,
				};
			}
		}
		fireEvent(this, 'config-changed', { config: this._config });
	}
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
	type: 'atomic-calendar-revive',
	name: 'Atomic Calendar Revive',
	description: 'An advanced calendar card for Home Assistant with Lovelace.',
});
