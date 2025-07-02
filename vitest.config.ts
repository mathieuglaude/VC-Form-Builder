import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.e2e.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@shared': path.resolve(__dirname, 'packages/shared/src'),
      '@external': path.resolve(__dirname, 'packages/external/src'),
    },
  },
});