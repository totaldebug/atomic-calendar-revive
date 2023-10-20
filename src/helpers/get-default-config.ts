import { HomeAssistant } from 'custom-card-helpers';

export function getDefaultConfig(hass: HomeAssistant) {
	const calendarEntities = Object.keys(hass.states).filter((entityId) => {
		const stateObj = hass.states[entityId];
		return (
			(stateObj.state && stateObj.attributes && stateObj.attributes.device_class === 'calendar') ||
			stateObj.entity_id.includes('calendar')
		);
	});

	return {
		type: 'custom:atomic-calendar-revive',
		name: 'Calendar',
		enableModeChange: true,
		entities: [{
			entity: calendarEntities[0] ?? '',
		}],
	};
}
