import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import typescript from '@rollup/plugin-typescript';

const plugins = [
	nodeResolve({
		jsnext: true,
		main: true,
	}),
	eslint(),
	commonjs(),
	typescript({ tsconfig: './tsconfig.json' }),
	json(),
	babel({
		babelHelpers: 'bundled',
		compact: true,
		extensions: ['.js', '.ts', '.mjs'],
		presets: [
			'@babel/preset-typescript',
			[
				'@babel/env',
				{
					modules: false,
					targets: 'iOS 12, > 2.5%, not dead',
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
			'@babel/plugin-proposal-class-properties',
			'@babel/plugin-transform-template-literals',
		],
	}),
	terser(),
	serve({
		contentBase: './dist',
		host: '0.0.0.0',
		port: 5500,
		allowCrossOrigin: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	}),
];

export default {
	input: ['./src/index.ts'],
	output: {
		file: 'dist/atomic-calendar-revive.js',
		format: 'umd',
		name: 'AtomicCalendarRevive',
		inlineDynamicImports: false,
	},
	watch: {
		clearScreen: false,
	},
	plugins: [...plugins],
};
