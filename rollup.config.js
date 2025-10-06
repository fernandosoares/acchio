import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

// Configuração principal para JavaScript
const jsConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({ 
      tsconfig: './tsconfig.json',
      sourceMap: true,
      declaration: false // Não gera declarations aqui
    })
  ],
  external: ['https', 'http', 'url', 'util', 'stream', 'zlib']
};

// Configuração para tipos TypeScript
const typesConfig = {
  input: 'src/index.ts', // Usa o source, não o output
  output: [
    { file: 'dist/index.d.ts', format: 'esm' }
  ],
  plugins: [
    dts()
  ]
};

export default [jsConfig, typesConfig];