import { HomeAssistant } from '../types/homeassistant';

// Globalise the hass object so that localize can utilise it.

export const globalData = {
	hass: null as HomeAssistant | null,
	language: null as string | null,
};

export function setHass(hass: HomeAssistant) {
	globalData.hass = hass;
}

export function setLanguage(language: string | null | undefined) {
	globalData.language = language ?? null;
}
