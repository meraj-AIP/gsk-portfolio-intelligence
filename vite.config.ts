import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  server: { port: 3000 },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@mui')) return 'mui';
          if (id.includes('@tanstack')) return 'query';
          return undefined;
        },
      },
    },
  },
});
