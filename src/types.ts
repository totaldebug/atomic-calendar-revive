import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';

// TODO Add your configuration elements here for type-checking
export interface atomicCardConfig extends LovelaceCardConfig {
	entity_config: boolean;
	color: string;
	columns: number;
	decimal: number;
	direction: string;
	double_tap_action?: ActionConfig;
	entities: any;
	entity_row: boolean;
	entity: string;
	height: string | number;
	hold_action?: ActionConfig;
	icon: any;
	limit_value: boolean;
	max: number;
	min: number;
	name: string;
	stack: string;
	tap_action?: ActionConfig;
	title: string;
	type: string;
	unit_of_measurement: string;
	width: string;
	language: string;
}
