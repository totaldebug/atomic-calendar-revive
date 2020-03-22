import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import commonjs from 'rollup-plugin-commonjs';


export default {
    input: './src/atomic-calendar-revive.js',
    output: {
        dir: 'dist'
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
