import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import commonjs from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve';

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
    resolve(),
    commonjs(),
    dev && serve(serveopts),
    !dev && terser(),
];


export default {
    input: ['./src/app.js', './src/app-editor.js'],
    output: {
        dir: 'dist',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
    },
	watch: {
    clearScreen: false
    },
    plugins: [...plugins],
};
