import { defineConfig } from '@playwright/test';
export default defineConfig({
  timeout: 60000,
  use: {
    viewport: { width: 1280, height: 800 },
  },
  webServer: undefined, // not used for Electron
  reporter: [['list']],
});
