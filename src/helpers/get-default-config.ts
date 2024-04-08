import { HomeAssistant } from '../types/homeassistant';

export function getDefaultConfig(hass: HomeAssistant) {
	// Get an array of calendar entities with their full objects
	const calendarEntities = Object.keys(hass.states)
		.map((entityId) => ({
			entity_id: entityId,
			stateObj: hass.states[entityId],
		}))
		.filter((entity) => {
			const { stateObj } = entity;
			return (
				(stateObj.state && stateObj.attributes && stateObj.attributes.device_class === 'calendar') ||
				stateObj.entity_id.includes('calendar')
			);
		});

	return {
		type: 'custom:atomic-calendar-revive',
		name: 'Calendar',
		enableModeChange: true,
		entities: [
			{
				entity: calendarEntities[0]['entity_id'] ?? '',
				icon: calendarEntities[0]['stateObj']?.attributes?.icon ?? '',
			},
		],
	};
}
