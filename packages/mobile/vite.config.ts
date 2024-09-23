import { resolve } from 'node:path';

import { eruda } from '@publish/dev';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

const enableRemoteDebug = process.env.ENABLE_REMOTE_DEBUG === 'true';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eruda({ debug: enableRemoteDebug }),
    mkcert(),
    react({ plugins: [['@swc-jotai/react-refresh', {}]] }),
    vanillaExtractPlugin(),
  ],
  envDir: resolve(__dirname, '../../'),
  clearScreen: false,
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
});
