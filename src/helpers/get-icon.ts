import { html } from 'lit';

import EventClass from '../lib/event.class';
import { atomicCardConfig } from '../types/config';
import { HomeAssistant } from '../types/homeassistant';

// Function to get the icon for a specific entity
export function getEntityIcon(entityId: string, hass: HomeAssistant): string | null {
	const stateObj = hass.states[entityId];

	if (entityId === undefined) {
		return null;
	}

	if (stateObj) {
		return stateObj.attributes.icon || 'mdi:circle';
	} else {
		return 'mdi:circle'; // Default icon if entity not found or has no icon
	}
}

/**
 * Gets the icon for a specific event
 * @param config card configuration
 * @param event event to get icon from
 * @returns TemplateResult with Icon
 */
export function getEventIcon(config: atomicCardConfig, event: EventClass, hass: HomeAssistant) {
	const iconColor: string =
		typeof event.entityConfig.color !== 'undefined' ? event.entityConfig.color : config.eventTitleColor;

	let { icon } = event.entityConfig;

	if (!icon || icon === 'undefined') {
		// If icon is not set or is 'undefined', use getEntityIcon as a fallback
		icon = getEntityIcon(event.entityConfig.entity, hass);
	}

	if (!config.showEventIcon || icon === null) {
		return html``; // Return an empty HTML element if config.showEventIcon is false
	} else {
		return html`<ha-icon class="event-icon" style="color: ${iconColor};" icon="${icon}"></ha-icon>`;
	}
}
