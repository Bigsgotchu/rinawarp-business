/**
 * vite.config.js
 * -----------------------------------------
 * RinaWarp Terminal Pro – Renderer Config for Electron + Vite
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig(({ command, mode }) => {
  const outDir = resolve(__dirname, 'dist');

  // Inject the dev server URL so Electron can load it
  const devServerUrl = 'http://localhost:5173';
  if (isDev && !process.env.VITE_DEV_SERVER_URL) {
    process.env.VITE_DEV_SERVER_URL = devServerUrl;
    console.log('🔗 VITE_DEV_SERVER_URL set:', devServerUrl);
  }

  return {
    root: __dirname, // Source folder for your frontend UI
    base: './',
    build: {
      outDir,
      emptyOutDir: true,
      target: 'esnext',
      assetsDir: 'assets',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      open: false,
      host: 'localhost',
      watch: {
        ignored: ['**/dist/**', '**/node_modules/**'],
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@electron': resolve(__dirname, 'electron'),
        '@shared': resolve(__dirname, '../../../websites/shared'),
      },
    },
    define: {
      __DEV__: JSON.stringify(isDev),
    },
    esbuild: {
      target: 'esnext',
    },
    plugins: [
      // Custom plugin to export VITE_DEV_SERVER_URL to a file for Electron
      {
        name: 'write-dev-server-url',
        apply: 'serve',
        configureServer(server) {
          const envFile = resolve(__dirname, '.vite-dev-url');
          fs.writeFileSync(envFile, `VITE_DEV_SERVER_URL=${devServerUrl}`);
          console.log('🪄 Wrote Vite dev server URL to:', envFile);
        },
      },
    ],
  };
});
