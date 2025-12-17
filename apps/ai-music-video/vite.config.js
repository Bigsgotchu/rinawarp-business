import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../frontend/dist',
    emptyOutDir: true,
  },
  plugins: [react()],
});
