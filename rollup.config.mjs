import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import json from 'rollup-plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import {builtinModules, createRequire} from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default {
  // Treat Node.js built-ins and AWS SDK packages as external dependencies
  // so they are not bundled into the output.
  external: [
    ...builtinModules,
    '@aws-sdk/client-rekognition',
    '@smithy/node-http-handler',
    '@aws-sdk/client-ses',
  ],

  // Library entry point.
  input: './src/index.ts',

  plugins: [
    // Compile TypeScript and emit declaration files to the directory specified in tsconfig.
    typescript({
      tsconfigDefaults: {compilerOptions: {}},
      tsconfig: 'tsconfig.json',
      tsconfigOverride: {compilerOptions: {}},
      useTsconfigDeclarationDir: true
    }),

    // Minify the output.
    terser(),

    // Allow importing JSON files.
    json(),

    // Convert CommonJS modules to ES modules for tree-shaking.
    commonjs(),

    // Resolve third-party modules from node_modules.
    nodeResolve({
      mainFields: ['module', 'main'],
    })
  ],

  // Produce both ESM and CJS builds.
  output: [
    {
      format: 'esm',
      file: pkg.module
    },
    {
      format: 'cjs',
      file: pkg.main
    }
  ],
}
