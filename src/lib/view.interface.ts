import { TemplateResult } from 'lit';

import { atomicCardConfig } from '../types/config';
import { HomeAssistant } from '../types/homeassistant';

export interface ICalendarView {
	update(hass: HomeAssistant, config: atomicCardConfig): Promise<void>;
	render(): TemplateResult;
}
