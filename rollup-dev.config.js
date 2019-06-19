import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


export default {
    input: 'app.js',
    output: {
        file: 'atomic_calendar.js',
        format: 'iife'
    },
	watch: {
    clearScreen: false
    },
    plugins: [
        resolve(),
	    commonjs({ fast: true }),
    ]
};
