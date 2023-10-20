export interface Option {
	name: string;
	icon: string;
	description: string;
	show: boolean;
	properties: UnionProperty[];
}

export interface Property {
	type: string;
	section?: string;
	name: string;
	label: string;
	default?: string | boolean | number;
	entity?: string;
}

export interface DropdownProperty extends Property {
	type: 'dropdown';
	items: string[];
	selected: number;
}

export interface TextProperty extends Property {
	type: 'text';
}

export interface NumberProperty extends Property {
	type: 'number';
	min: number;
	max: number;
}

export interface SwitchProperty extends Property {
	type: 'switch';
}

export type UnionProperty = DropdownProperty | TextProperty | NumberProperty | SwitchProperty;
