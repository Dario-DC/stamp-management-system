import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Use Node.js environment for backend tests
    // Don't include the jsdom setup file for backend tests
    include: ['src/test/backend.test.js']
  }
})
