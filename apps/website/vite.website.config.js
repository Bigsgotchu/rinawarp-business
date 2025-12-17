import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      filename: 'dist-website/bundle-analysis.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist-website',
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      input: './index.html',
      output: {
        // Simple output configuration for static HTML
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  // Server configuration for development
  server: {
    port: 3001,
    open: false,
  },
});
