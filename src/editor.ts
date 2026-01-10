import dayjs from 'dayjs';
import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import memoizeOne from 'memoize-one';

import { fireEvent } from './common/fire-event';
import defaults from './defaults';
import {
	appearanceSchema,
	calendarSchema,
	entitySchema,
	eventSchema,
	mainSchema,
	plannerSchema,
} from './editor-schema';
import { style } from './style-editor';
import { atomicCardConfig } from './types/config';
import { HomeAssistant } from './types/homeassistant';
import { LovelaceCardEditor } from './types/lovelace';

@customElement('atomic-calendar-revive-editor')
export class AtomicCalendarReviveEditor extends LitElement implements LovelaceCardEditor {
	@property({ attribute: false }) public hass!: HomeAssistant;
	@state() private _config!: atomicCardConfig;
	@state() private _helpers?: any;
	private _initialized = false;

	static get styles() {
		return [
			style,
			css`
				.card-config {
					display: flex;
					flex-direction: column;
					gap: 16px;
				}
				.option {
					padding: 4px 0;
					cursor: pointer;
				}
				.row {
					display: flex;
					align-items: center;
					margin-bottom: 8px;
				}
				.title {
					font-size: 16px;
					font-weight: bold;
					margin-left: 8px;
				}
				.secondary {
					color: var(--secondary-text-color);
				}
				.values {
					padding-left: 16px;
					background: var(--secondary-background-color);
					padding: 16px;
				}
				ha-expansion-panel {
					margin-bottom: 8px;
				}
			`,
		];
	}

	public setConfig(config: atomicCardConfig): void {
		this._config = { ...defaults, ...config };
		this.loadCardHelpers();
	}

	protected shouldUpdate(): boolean {
		if (!this._initialized) {
			this._initialize();
		}
		return true;
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

	private _computeSchema = memoizeOne((schema: any[]) => {
		return schema.map((field) => {
			if (field.name === 'firstDayOfWeek') {
				const weekdays = dayjs.weekdays();
				const options = weekdays.map((day, index) => ({
					value: index,
					label: day,
				}));
				return {
					...field,
					selector: {
						select: {
							options: options,
							mode: 'dropdown',
						},
					},
				};
			}
			return field;
		});
	});

	protected render(): TemplateResult | void {
		if (!this.hass || !this._helpers) {
			return html``;
		}

		// Ensure dayjs locale is set
		if (this.hass.language) {
			dayjs.locale(this.hass.language.toLowerCase());
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
				<ha-expansion-panel outlined>
					<div slot="header" class="title">Main Settings</div>
					<div class="values">
						<ha-form
							.hass=${this.hass}
							.data=${this._config}
							.schema=${this._computeSchema(mainSchema)}
							.computeLabel=${this._computeLabel}
							@value-changed=${this._valueChanged}
						></ha-form>
					</div>
				</ha-expansion-panel>

				<ha-expansion-panel outlined>
					<div slot="header" class="title">Event Mode</div>
					<div class="values">
						<ha-form
							.hass=${this.hass}
							.data=${this._config}
							.schema=${eventSchema}
							.computeLabel=${this._computeLabel}
							@value-changed=${this._valueChanged}
						></ha-form>
					</div>
				</ha-expansion-panel>

				<ha-expansion-panel outlined>
					<div slot="header" class="title">Calendar Mode</div>
					<div class="values">
						<ha-form
							.hass=${this.hass}
							.data=${this._config}
							.schema=${calendarSchema}
							.computeLabel=${this._computeLabel}
							@value-changed=${this._valueChanged}
						></ha-form>
					</div>
				</ha-expansion-panel>

				<ha-expansion-panel outlined>
					<div slot="header" class="title">Planner Mode</div>
					<div class="values">
						<ha-form
							.hass=${this.hass}
							.data=${this._config}
							.schema=${plannerSchema}
							.computeLabel=${this._computeLabel}
							@value-changed=${this._valueChanged}
						></ha-form>
					</div>
				</ha-expansion-panel>

				<ha-expansion-panel outlined>
					<div slot="header" class="title">Appearance</div>
					<div class="values">
						<ha-form
							.hass=${this.hass}
							.data=${this._config}
							.schema=${appearanceSchema}
							.computeLabel=${this._computeLabel}
							@value-changed=${this._valueChanged}
						></ha-form>
					</div>
				</ha-expansion-panel>

				<ha-expansion-panel outlined>
					<div slot="header" class="title">Actions</div>
					<div class="values">${this.renderActions()}</div>
				</ha-expansion-panel>

				<ha-expansion-panel outlined>
					<div slot="header" class="title">Entities</div>
					<div class="values">${this.renderEntities()}</div>
				</ha-expansion-panel>
			</div>
		`;
	}

	private renderEntities(): TemplateResult {
		const entities = this._config.entities || [];
		const entityIds = entities.map((e) => (typeof e === 'string' ? e : e.entity));

		return html`
			<ha-selector
				.hass=${this.hass}
				.selector=${{ entity: { multiple: true, domain: 'calendar' } }}
				.value=${entityIds}
				.label=${'Selected Calendars'}
				@value-changed=${this._entitiesChanged}
			></ha-selector>

			${entities.map((entity, index) => {
				const entityObj = typeof entity === 'string' ? { entity } : entity;
				return html`
					<ha-expansion-panel outlined style="margin-top: 8px;">
						<div slot="header">${entityObj.entity}</div>
						<div class="values">
							<ha-form
								.hass=${this.hass}
								.data=${entityObj}
								.schema=${entitySchema}
								.computeLabel=${(schema) => schema.label || schema.name}
								@value-changed=${(ev) => this._entityValueChanged(ev, index)}
							></ha-form>
						</div>
					</ha-expansion-panel>
				`;
			})}
		`;
	}

	private renderActions(): TemplateResult {
		const actions = ['tap_action', 'hold_action', 'double_tap_action'];
		return html`
			${actions.map(
				(action) => html`
					<div class="option" style="margin-bottom: 8px;">
						<ha-selector
							.hass=${this.hass}
							.selector=${{ ui_action: {} }}
							.value=${this._config[action]}
							.label=${action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
							@value-changed=${(ev) => this._actionValueChanged(ev, action)}
						></ha-selector>
					</div>
				`,
			)}
		`;
	}

	private _computeLabel(schema: any) {
		return schema.label || schema.name;
	}

	private _valueChanged(ev: CustomEvent): void {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		fireEvent(this, 'config-changed', { config: ev.detail.value });
	}

	private _actionValueChanged(ev: CustomEvent, action: string): void {
		this._config = { ...this._config, [action]: ev.detail.value };
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		fireEvent(this, 'config-changed', { config: this._config });
	}

	private _entitiesChanged(ev: CustomEvent): void {
		const newIds = ev.detail.value as string[];
		const currentEntities = this._config.entities || [];

		// Filter keep existing configs for selected IDs, add new ones for new IDs
		const newEntities = newIds.map((id) => {
			const existing = currentEntities.find((e) => (typeof e === 'string' ? e : e.entity) === id);
			return existing || { entity: id };
		});

		this._config = { ...this._config, entities: newEntities };
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		fireEvent(this, 'config-changed', { config: this._config });
	}

	private _entityValueChanged(ev: CustomEvent, index: number): void {
		const newEntityConfig = ev.detail.value;
		const entities = [...(this._config.entities || [])];
		entities[index] = newEntityConfig;
		this._config = { ...this._config, entities };
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		fireEvent(this, 'config-changed', { config: this._config });
	}
}
