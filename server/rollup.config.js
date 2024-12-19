import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild';

export default {
  input: 'app.js',
  output: {
    file: '../dist/server.js',
    format: 'es',
  },
  plugins: [
    resolve(),
    commonjs(),
    json(),
    esbuild({
      minify: true,
    }),
  ],
  external: ['express'],
};
