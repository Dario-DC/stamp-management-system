import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // Exclude backend tests (they have their own config)
    exclude: ['**/backend.test.js', '**/node_modules/**']
  }
})