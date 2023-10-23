import { HomeAssistant } from 'custom-card-helpers';

// Globalise the hass object so that localize can utilise it.

export const globalData = {
	hass: null as HomeAssistant | null,
};

export function setHass(hass: HomeAssistant) {
	globalData.hass = hass;
}
