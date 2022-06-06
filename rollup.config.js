import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

const bundle = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/esm/index.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/src/__tests__', '**/*.test.ts', '**/*.test.ts'],
      }),
    ],
  },
  {
    input: 'src/@types/index.d.ts',
    output: [{ file: 'build/index.d.ts', format: 'cjs' }],
    plugins: [dts()],
  },
];

export default bundle;
