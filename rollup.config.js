import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import eslint from '@rollup/plugin-eslint';
import minify from 'rollup-plugin-babel-minify';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
    contentBase: ['./dist'],
    host: '0.0.0.0',
    port: 5000,
    allowCrossOrigin: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
};

const plugins = [
    resolve({
        jsnext: true,
        main: true,
        browser: true,
    }),
    eslint(),
    commonjs(),
    typescript(),
    json(),
    babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets: [
            [
                '@babel/preset-env',
                {
                    "modules": false,
                    "targets": "> 2.5%, not dead"
                }
            ]
        ],
        plugins: [
            [
                "@babel/plugin-proposal-decorators",
                {
                    "legacy": true
                }
            ],
            [
                "@babel/plugin-proposal-class-properties",
                {
                    "loose": true
                }
            ],
            [
                "@babel/plugin-transform-template-literals"
            ]
        ]
    }),
    minify({
        "evaluate": false,
        "mangle": false,
    }),
    dev && serve(serveopts),
    !dev && terser(),
];

export default {
    input: ['./src/index.ts'],
    output: {
        file: './dist/index.js',
        format: 'iife',
        sourcemap: "inline",
        compact: true,
    },
    watch: {
        clearScreen: false,
    },
    plugins: [...plugins],
};
