import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist-website/bundle-analysis.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    outDir: 'dist-website',
    emptyOutDir: true,
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 200, // Lower limit for website
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules into vendor chunks
          if (id.includes('node_modules')) {
            // Heavy libraries
            if (id.includes('react') || id.includes('react-dom'))
              return 'react';
            if (id.includes('stripe')) return 'stripe';
            if (id.includes('aws-sdk') || id.includes('aws')) return 'aws';

            // UI libraries
            if (id.includes('tailwindcss') || id.includes('postcss'))
              return 'ui';

            // Other libraries
            if (id.includes('lodash') || id.includes('ramda')) return 'utils';
            if (id.includes('moment') || id.includes('date-fns')) return 'date';

            // Default vendor chunk
            return 'vendor';
          }

          // Split website components
          if (id.includes(path.resolve(__dirname, 'src/website/'))) {
            if (id.includes('App.jsx')) return 'website-app';
            if (id.includes('downloads.html')) return 'downloads';
            return 'website';
          }

          // Split other components
          if (id.includes(path.resolve(__dirname, 'src/components/'))) {
            return 'components';
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          return 'assets/[name]-[hash].js';
        },
        entryFileNames: 'assets/[name]-[hash].js',
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
    open: true,
  },
});
