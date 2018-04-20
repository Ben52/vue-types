import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import filesize from 'rollup-plugin-filesize'

import { version, name, license, author, homepage } from './package.json'

const banner = `
/*! ${name} - v${version}
 * ${homepage}
 * Copyright (c) ${(new Date().getFullYear())} - ${author};
 * Licensed ${license}
 */
`

const plugins = [
  resolve(),
  commonjs(),
  typescript({
    typescript: require('typescript')
  })
]

const baseOutputConfig = {
  format: 'umd',
  name: 'VueTypes',
  sourcemap: true,
  banner
}

export default [
  {
    input: 'src/index.ts',
    external: ['vue'],
    output: Object.assign({ file: 'umd/vue-types.js'}, baseOutputConfig),
    plugins: [replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }), ...plugins, filesize()]
  },
  {
    input: 'src/index.ts',
    external: ['vue'],
    output: Object.assign({ file: 'umd/vue-types.min.js' }, baseOutputConfig),
    plugins: [replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }), ...plugins, uglify({
      warnings: false,
      mangle: true,
      compress: {
        pure_funcs: ['warn']
      },
      output: {
        comments: /^!/
      }
    }), filesize()]
  }
]
