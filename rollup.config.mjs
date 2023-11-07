import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import { ignoreSelectFiles } from './elements/ignore/select';
import { ignoreSwitchFiles } from './elements/ignore/switch';
import { ignoreTextfieldFiles } from './elements/ignore/textfield';
import ignore from './rollup-plugins/ignore';

const plugins = [
	nodeResolve({
		jsnext: true,
		main: true,
	}),
	eslint(),
	commonjs(),
	typescript(),
	json(),
	babel({
		exclude: 'node_modules/**',
		babelHelpers: 'bundled',
		compact: true,
		extensions: ['.js', '.ts'],
		presets: [
			[
				'@babel/env',
				{
					modules: false,
					targets: '> 2.5%, not dead',
				},
			],
		],
		plugins: [
			[
				'@babel/plugin-proposal-decorators',
				{
					legacy: true,
				},
			],
			['@babel/plugin-proposal-class-properties'],
			['@babel/plugin-transform-template-literals'],
		],
	}),
	terser(),
	ignore({
		files: [...ignoreTextfieldFiles, ...ignoreSwitchFiles, ...ignoreSelectFiles].map((file) => require.resolve(file)),
	}),
];

export default {
	input: ['./src/index.ts'],
	output: {
		file: 'dist/atomic-calendar-revive.js',
		format: 'umd',
		name: 'AtomicCalendarRevive',
	},
	watch: {
		clearScreen: false,
	},
	plugins: [...plugins],
};
