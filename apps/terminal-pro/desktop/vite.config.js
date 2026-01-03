import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  // Build-time environment injection - compile-time only
  const isDev = command === 'serve' || mode === 'development';
  const rinawarpDevBuild = process.env.RINAWARP_DEV_BUILD === 'true';

  return {
    root: resolve(__dirname, 'src/renderer'),
    server: {
      port: 5173,
      strictPort: true,
    },
    build: {
      outDir: resolve(__dirname, 'dist/renderer'),
      emptyOutDir: true,
      // Build-time defines - compile-time constants only
      define: {
        __RINAWARP_DEV_BUILD__: JSON.stringify(rinawarpDevBuild),
        __RINAWARP_UPDATE_CHANNEL__: JSON.stringify(rinawarpDevBuild ? 'dev' : 'stable'),
        __RINAWARP_UPDATE_FEED__: JSON.stringify(
          `https://downloads.rinawarptech.com/updates/${rinawarpDevBuild ? 'dev' : 'stable'}/latest.json`,
        ),
      },
    },
  };
});
