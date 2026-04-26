import { fireEvent } from '../common/fire-event';
import { HomeAssistant } from '../types/homeassistant';
import { ActionConfig } from '../types/lovelace';

export const handleAction = (
	node: HTMLElement,
	hass: HomeAssistant,
	config: {
		tap_action?: ActionConfig;
		hold_action?: ActionConfig;
		double_tap_action?: ActionConfig;
	},
	action: string,
	entityId?: string,
): void => {
	let actionConfig: ActionConfig | undefined;

	if (action === 'tap' && config.tap_action) {
		actionConfig = config.tap_action;
	} else if (action === 'hold' && config.hold_action) {
		actionConfig = config.hold_action;
	} else if (action === 'double_tap' && config.double_tap_action) {
		actionConfig = config.double_tap_action;
	}

	if (!actionConfig) {
		actionConfig = { action: 'more-info' };
	}

	if (actionConfig.action === 'more-info' && !entityId) {
		actionConfig = { action: 'none' };
	}

	if (
		actionConfig.confirmation &&
		(!actionConfig.confirmation.exemptions ||
			!actionConfig.confirmation.exemptions.some((e) => e.user === hass.user?.id)) &&
		!confirm(actionConfig.confirmation.text || `Are you sure you want to ${actionConfig.action}?`)
	) {
		return;
	}

	switch (actionConfig.action) {
		case 'more-info':
			if (entityId) {
				fireEvent(node, 'hass-more-info' as never, { entityId } as never);
			}
			break;
		case 'navigate':
			if (actionConfig.navigation_path) {
				history.pushState(null, '', actionConfig.navigation_path);
				fireEvent(window, 'location-changed' as never, { replace: false } as never);
			}
			break;
		case 'url':
			if (actionConfig.url_path) {
				window.open(actionConfig.url_path);
			}
			break;
		case 'toggle':
			if (entityId) {
				hass.callService('homeassistant', 'toggle', { entity_id: entityId });
			}
			break;
		case 'call-service': {
			if (!actionConfig.service) break;
			const [domain, service] = actionConfig.service.split('.', 2);
			const data = { ...(actionConfig.service_data ?? {}), ...(actionConfig.data ?? {}) };
			hass.callService(domain, service, data, actionConfig.target);
			break;
		}
		case 'fire-dom-event':
			fireEvent(node, 'll-custom' as never, actionConfig as never);
			break;
		case 'none':
		default:
			break;
	}
};
