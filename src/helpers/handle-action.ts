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

	if (
		actionConfig.confirmation &&
		(!actionConfig.confirmation.exemptions ||
			!actionConfig.confirmation.exemptions.some((e) => e.user === hass.user?.id))
	) {
		if (!confirm(actionConfig.confirmation.text || `Are you sure you want to ${actionConfig.action}?`)) {
			return;
		}
	}

	const event = new Event('hass-action', { bubbles: true, composed: true });
	(event as any).detail = {
		config: actionConfig,
		action: action,
	};

	if (actionConfig.action === 'more-info' && entityId) {
		(event as any).detail.config = { ...actionConfig, entity: entityId };
	}

	node.dispatchEvent(event);
};
