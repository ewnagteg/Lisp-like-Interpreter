import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@src': '/src',
    },
  },
  test: {
    include: ['test/**/*.ts'],
    globals: true,
  },
});