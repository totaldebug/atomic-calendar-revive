import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import commonjs from 'rollup-plugin-commonjs';


export default {
    input: 'app.js',
    output: {
        file: 'dist/atomic_calendar.js',
        format: 'iife'
    },
	watch: {
    clearScreen: false
    },
    plugins: [
        resolve(),
        commonjs(),
        terser()
    ]
};
