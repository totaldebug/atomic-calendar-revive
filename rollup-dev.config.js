import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

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
    plugins: [
        resolve(),
        commonjs({ fast: true})
    ]
};
