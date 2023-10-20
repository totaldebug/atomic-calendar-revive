import { HomeAssistant } from 'custom-card-helpers';

// Function to get the icon for a specific entity
export function getEntityIcon(entityId: string, hass: HomeAssistant): string {
	const stateObj = hass.states[entityId];

	if (stateObj) {
		return stateObj.attributes.icon || 'mdi:circle';
	} else {
		return 'mdi:circle'; // Default icon if entity not found or has no icon
	}
}
