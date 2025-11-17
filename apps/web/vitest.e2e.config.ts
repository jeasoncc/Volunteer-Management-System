import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'e2e',
    include: ['**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 30000,
    hookTimeout: 30000,
    globals: true,
    environment: 'node',
  },
})
