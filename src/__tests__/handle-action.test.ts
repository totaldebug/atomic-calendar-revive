import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { handleAction } from '../helpers/handle-action';
import { HomeAssistant } from '../types/homeassistant';
import { ActionConfig } from '../types/lovelace';

interface FakeNode {
	dispatchEvent: ReturnType<typeof vi.fn>;
}

function makeNode(): FakeNode {
	return { dispatchEvent: vi.fn() };
}

function makeHass(userId = 'user-1'): HomeAssistant {
	return {
		user: { id: userId },
		callService: vi.fn().mockResolvedValue(undefined),
	} as unknown as HomeAssistant;
}

let pushStateSpy: ReturnType<typeof vi.fn>;
let windowOpenSpy: ReturnType<typeof vi.fn>;
let confirmSpy: ReturnType<typeof vi.fn>;
let windowDispatchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
	pushStateSpy = vi.fn();
	windowOpenSpy = vi.fn();
	confirmSpy = vi.fn(() => true);
	windowDispatchSpy = vi.fn();

	vi.stubGlobal('history', { pushState: pushStateSpy });
	vi.stubGlobal('window', {
		open: windowOpenSpy,
		dispatchEvent: windowDispatchSpy,
	});
	vi.stubGlobal('confirm', confirmSpy);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('handleAction: more-info', () => {
	test('fires hass-more-info with the entity id', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(node as unknown as HTMLElement, hass, { tap_action: { action: 'more-info' } }, 'tap', 'light.kitchen');
		expect(node.dispatchEvent).toHaveBeenCalledTimes(1);
		const ev = node.dispatchEvent.mock.calls[0][0] as Event;
		expect(ev.type).toBe('hass-more-info');
		expect((ev as unknown as { detail: { entityId: string } }).detail.entityId).toBe('light.kitchen');
	});

	test('falls back to no-op when no entityId is supplied', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(node as unknown as HTMLElement, hass, { tap_action: { action: 'more-info' } }, 'tap');
		expect(node.dispatchEvent).not.toHaveBeenCalled();
	});

	test('defaults to more-info when no tap_action is configured', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(node as unknown as HTMLElement, hass, {}, 'tap', 'light.kitchen');
		const ev = node.dispatchEvent.mock.calls[0][0] as Event;
		expect(ev.type).toBe('hass-more-info');
	});
});

describe('handleAction: navigate', () => {
	test('pushes history state and dispatches location-changed on window', () => {
		const node = makeNode();
		const hass = makeHass();
		const cfg: ActionConfig = { action: 'navigate', navigation_path: '/lovelace/dashboard' };
		handleAction(node as unknown as HTMLElement, hass, { tap_action: cfg }, 'tap');
		expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/lovelace/dashboard');
		expect(windowDispatchSpy).toHaveBeenCalledTimes(1);
		const ev = windowDispatchSpy.mock.calls[0][0] as Event;
		expect(ev.type).toBe('location-changed');
	});

	test('is a no-op when navigation_path is missing', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{ tap_action: { action: 'navigate' } as unknown as ActionConfig },
			'tap',
		);
		expect(pushStateSpy).not.toHaveBeenCalled();
		expect(windowDispatchSpy).not.toHaveBeenCalled();
	});
});

describe('handleAction: url', () => {
	test('opens the configured URL', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{ tap_action: { action: 'url', url_path: 'https://example.com' } },
			'tap',
		);
		expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com');
	});

	test('is a no-op when url_path is missing', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{ tap_action: { action: 'url' } as unknown as ActionConfig },
			'tap',
		);
		expect(windowOpenSpy).not.toHaveBeenCalled();
	});
});

describe('handleAction: toggle', () => {
	test('calls homeassistant.toggle with the entity id', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(node as unknown as HTMLElement, hass, { tap_action: { action: 'toggle' } }, 'tap', 'switch.lamp');
		expect(hass.callService).toHaveBeenCalledWith('homeassistant', 'toggle', { entity_id: 'switch.lamp' });
	});

	test('is a no-op when no entity id is supplied', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(node as unknown as HTMLElement, hass, { tap_action: { action: 'toggle' } }, 'tap');
		expect(hass.callService).not.toHaveBeenCalled();
	});
});

describe('handleAction: call-service', () => {
	test('calls the configured service with merged data', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{
				tap_action: {
					action: 'call-service',
					service: 'light.turn_on',
					service_data: { brightness: 100 },
					data: { transition: 2 },
				},
			},
			'tap',
			'light.kitchen',
		);
		expect(hass.callService).toHaveBeenCalledWith(
			'light',
			'turn_on',
			expect.objectContaining({ brightness: 100, transition: 2, entity_id: 'light.kitchen' }),
			undefined,
		);
	});

	test('does not override an explicit entity_id in service data', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{
				tap_action: {
					action: 'call-service',
					service: 'light.turn_on',
					data: { entity_id: 'light.bedroom' },
				},
			},
			'tap',
			'light.kitchen',
		);
		expect(hass.callService).toHaveBeenCalledWith(
			'light',
			'turn_on',
			expect.objectContaining({ entity_id: 'light.bedroom' }),
			undefined,
		);
	});

	test('does not auto-fill entity_id when a target is configured', () => {
		const node = makeNode();
		const hass = makeHass();
		const target = { area_id: 'kitchen' };
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{
				tap_action: {
					action: 'call-service',
					service: 'light.turn_on',
					target,
				},
			},
			'tap',
			'light.kitchen',
		);
		const lastCall = (hass.callService as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(lastCall[2]).not.toHaveProperty('entity_id');
		expect(lastCall[3]).toBe(target);
	});

	test('is a no-op when service is missing', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{ tap_action: { action: 'call-service' } as unknown as ActionConfig },
			'tap',
			'light.kitchen',
		);
		expect(hass.callService).not.toHaveBeenCalled();
	});
});

describe('handleAction: fire-dom-event', () => {
	test('fires ll-custom on the node with the action config as detail', () => {
		const node = makeNode();
		const hass = makeHass();
		const cfg = { action: 'fire-dom-event', foo: 'bar' } as unknown as ActionConfig;
		handleAction(node as unknown as HTMLElement, hass, { tap_action: cfg }, 'tap');
		expect(node.dispatchEvent).toHaveBeenCalledTimes(1);
		const ev = node.dispatchEvent.mock.calls[0][0] as Event;
		expect(ev.type).toBe('ll-custom');
	});
});

describe('handleAction: none / unknown', () => {
	test('action: none performs no side effects', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(node as unknown as HTMLElement, hass, { tap_action: { action: 'none' } }, 'tap', 'light.kitchen');
		expect(node.dispatchEvent).not.toHaveBeenCalled();
		expect(hass.callService).not.toHaveBeenCalled();
		expect(pushStateSpy).not.toHaveBeenCalled();
		expect(windowOpenSpy).not.toHaveBeenCalled();
	});
});

describe('handleAction: confirmation flow', () => {
	test('aborts when the user cancels the confirm prompt', () => {
		confirmSpy.mockReturnValueOnce(false);
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{ tap_action: { action: 'toggle', confirmation: { text: 'sure?' } } },
			'tap',
			'switch.lamp',
		);
		expect(confirmSpy).toHaveBeenCalledWith('sure?');
		expect(hass.callService).not.toHaveBeenCalled();
	});

	test('proceeds when the user accepts the confirm prompt', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{ tap_action: { action: 'toggle', confirmation: { text: 'sure?' } } },
			'tap',
			'switch.lamp',
		);
		expect(confirmSpy).toHaveBeenCalled();
		expect(hass.callService).toHaveBeenCalled();
	});

	test('skips the confirm prompt for exempt users', () => {
		const node = makeNode();
		const hass = makeHass('admin');
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{
				tap_action: {
					action: 'toggle',
					confirmation: { text: 'sure?', exemptions: [{ user: 'admin' }] },
				},
			},
			'tap',
			'switch.lamp',
		);
		expect(confirmSpy).not.toHaveBeenCalled();
		expect(hass.callService).toHaveBeenCalled();
	});
});

describe('handleAction: action selection by gesture', () => {
	test('hold uses hold_action', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{
				tap_action: { action: 'more-info' },
				hold_action: { action: 'navigate', navigation_path: '/held' },
			},
			'hold',
			'light.kitchen',
		);
		expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/held');
		expect(node.dispatchEvent).not.toHaveBeenCalled();
	});

	test('double_tap uses double_tap_action', () => {
		const node = makeNode();
		const hass = makeHass();
		handleAction(
			node as unknown as HTMLElement,
			hass,
			{
				tap_action: { action: 'more-info' },
				double_tap_action: { action: 'url', url_path: 'https://double.example' },
			},
			'double_tap',
		);
		expect(windowOpenSpy).toHaveBeenCalledWith('https://double.example');
	});
});
