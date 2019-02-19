import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import commonjs from 'rollup-plugin-commonjs';


export default {
    input: 'app.js',
    output: {
        file: 'atomic-calendar.js',
        format: 'iife'
    },
    plugins: [
        resolve(),
        commonjs(),
        terser()
    ]
};