import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.js',
  },
  coverage: {
    reporter: ['text', 'lcov', 'html'],
    exclude: ['node_modules/', 'dist/', 'build/', 'test/'],
  },
});
