import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';
import { TemplateResult } from 'lit-element';

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

export interface LongDateFormatSpec {
  LTS: string;
  LT: string;
  L: string;
  LL: string;
  LLL: string;
  LLLL: string;

 // lets forget for a sec that any upper/lower permutation will also work

 lts?: string;
 lt?: string;
 l?: string;
 ll?: string;
 lll?: string;
 llll?: string;
}
