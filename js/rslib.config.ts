import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      id: 'node',
      format: 'esm',
      syntax: ['node 22'],
      dts: {
        distPath: './dist/node',
      },
      output: {
        target: 'node',
        distPath: {
          root: './dist/node',
        },
      },
    },
    {
      id: 'browser',
      format: 'esm',
      syntax: ['chrome >= 111', 'safari >= 16.4', 'firefox >= 113', 'edge >= 111'],
      dts: false,
      output: {
        target: 'web',
        distPath: {
          root: './dist/browser',
        },
      },
    },
  ],
});
