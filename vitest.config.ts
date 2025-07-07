import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.e2e.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        'test-inventory.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@shared': path.resolve(__dirname, 'packages/shared/src'),
      '@ui': path.resolve(__dirname, 'packages/ui/src'),
      '@external': path.resolve(__dirname, 'packages/external/src'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
});