// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  build: {
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, './src/index.ts'),
      name: 'PublishPluginX',
      fileName: 'index',
    },
  },
});
