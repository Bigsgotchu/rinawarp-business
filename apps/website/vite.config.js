import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [react()],
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'https://api.rinawarptech.com'),
  },
});
