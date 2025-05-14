import '@deskbtm/gadgets/env';
import path from 'node:path';

import { __project, configure, HTML } from '@publish/dev';

const excludeChunks = ['sw'];

const config = configure({
  reactCompiler: false,
  entry: {
    main: path.resolve(__project, './src/main.tsx'),
    sw: {
      import: path.resolve(__project, './src/sw/index.ts'),
      filename: '[name].js',
    },
  },
  plugins: [
    new HTML({
      template: path.resolve(__project, './index.html'),
      inject: 'body',
      scriptLoading: 'module',
      minify: kProdMode,
      chunks: ['main'],
      filename: 'index.html',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks(chunk) {
        return !excludeChunks.includes(chunk.name);
      },
    },
  },
});

export default config;
