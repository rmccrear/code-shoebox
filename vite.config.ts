/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // These features load on demand. Prebundle them to avoid a development
    // reload that would discard edits when a learner first enables a feature.
    include: ['@emmetio/codemirror6-plugin', '@codemirror/autocomplete'],
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    // Source is browser/iframe-driven; only run our own unit specs.
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.demo-site', '.agents', '.claude']
  }
});
