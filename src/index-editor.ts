import { LitElement, html, customElement, TemplateResult, CSSResult, property } from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';
import { style } from './style-editor';
import { atomicCardConfig } from './types';
import { EDITOR_VERSION } from './const';

@customElement('atomic-calendar-revive-editor')
export default class AtomicCalendarReviveEditor extends LitElement {
	@property() public hass?: HomeAssistant;
	@property() private _config;
	@property() private _toggle?: boolean;

	static get styles(): CSSResult {
		return style;
	}

	public setConfig(config: atomicCardConfig): void {
		this._config = { ...config };
	}

	get entityOptions() {
		//Restrict of domain type
		const entities = Object.keys(this.hass!.states).filter((eid) => eid.substr(0, eid.indexOf('.')) === 'calendar');
		// Map entities
		const entityOptions = entities.map((eid) => {
			const matchingConfigEnitity = this._config.entities.find(
				(entity) => ((entity && entity.entity) || entity) === eid,
			);
			const originalEntity = this.hass!.states[eid];

			return {
				entity: eid,
				name: (matchingConfigEnitity && matchingConfigEnitity.name) || originalEntity.attributes.friendly_name || eid,
				checked: !!matchingConfigEnitity,
			};
			return entityOptions;
		});

		return entityOptions;
	}

	protected render(): TemplateResult | void {
		if (!this.hass) {
			return html``;
		}

		return html`
			<div class="card-config">
				<span style="color:red;font-weight:bold">
					Editor Version: ${EDITOR_VERSION}
				</span>
				<div class="entities">
					<h3>Entities (Required)</h3>
					${this.entityOptions.map((entity) => {
						return html`
							<div class="entity-select">
								<paper-checkbox
									@checked-changed="${this.entityChanged}"
									.checked=${entity.checked}
									.entityId="${entity.entity}"
								>
									${entity.entity}
								</paper-checkbox>
								${this._config.showEventOrigin
									? html`
											<div class="origin-calendar">
												<paper-input
													label="Calendar Origin"
													.value="${entity.name}"
													.entityId="${entity.entity}"
													@value-changed="${this.entityNameChanged}"
												></paper-input>
											</div>
										`
							: html``}
							</div>
						`;
					})}
				</div>
			</div>
		`;
	}
	/**
	 * update config for a checkbox input
	 * @param {*} ev
	 */
	checkboxChanged(ev) {
		if (this.cantFireEvent) return;
		const {
			target: { configValue },
			detail: { value },
		} = ev;

		this._config = Object.assign({}, this._config, { [configValue]: value });
		fireEvent(this, 'config-changed', { config: this._config });
	}

	/**
	 * change on text input
	 * @param {*} ev
	 */
	inputChanged(ev) {
		if (this.cantFireEvent) return;
		const {
			target: { configValue },
			detail: { value },
		} = ev;

		this._config = Object.assign({}, this._config, { [configValue]: value });
		fireEvent(this, 'config-changed', { config: this._config });
	}

	get entities() {
		const entities = [...(this._config.entities || [])];

		// convert any legacy entity strings into objects
		const entityObjects = entities.map((entity) => {
			if (entity.entity) return entity;
			return { entity, name: entity };
		});

		return entityObjects;
	}
	/**
	 * change the calendar name of an entity
	 * @param {*} ev
	 */
	entityNameChanged({ target: { entityId }, detail: { value } }) {
		if (this.cantFireEvent) return;
		let entityObjects = [...this.entities];

		entityObjects = entityObjects.map((entity) => {
			if (entity.entity === entityId) entity.name = value || '';
			return entity;
		});

		this._config = Object.assign({}, this._config, { entities: entityObjects });
		fireEvent(this, 'config-changed', { config: this._config });
	}
	/**
	 * add or remove calendar entities from config
	 * @param {*} ev
	 */
	entityChanged({ target: { entityId }, detail: { value } }) {
		if (this.cantFireEvent) return;
		let entityObjects = [...this.entities];

		if (value) {
			const originalEntity = this.hass.states[entityId];
			entityObjects.push({ entity: entityId, name: originalEntity.attributes.friendly_name || entityId });
		} else {
			entityObjects = entityObjects.filter((entity) => entity.entity !== entityId);
		}

		this._config = Object.assign({}, this._config, { entities: entityObjects });
		fireEvent(this, 'config-changed', { config: this._config });
	}
	/**
	 * stop events from firing if certains conditions not met
	 */
	get cantFireEvent() {
		return !this._config || !this.hass;
	}
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
	type: 'atomic-calendar-revive',
	name: 'Atomic Calendar Revive',
	description: 'An advanced calendar card for Home Assistant with Lovelace.',
});
