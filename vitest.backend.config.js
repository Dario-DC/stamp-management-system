import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Use Node.js environment for backend tests
    setupFiles: ['./src/test/backend-setup.js'], // Use backend-specific setup
    include: ['src/test/backend.test.js', 'src/test/database-init.test.js']
  }
})
