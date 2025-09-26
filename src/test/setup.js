// Test setup file
import { beforeEach, beforeAll, afterAll } from 'vitest'
import { rmSync } from 'fs'
import { dirname } from 'path'
import { mkdirSync } from 'fs'

// Set up test database path for frontend tests
const TEST_DB_PATH = './database/frontend_test_stamps.db'
process.env.STAMP_DB_PATH = TEST_DB_PATH

beforeAll(() => {
  // Ensure test database directory exists
  mkdirSync(dirname(TEST_DB_PATH), { recursive: true })
})

// Clean up DOM before each test
beforeEach(() => {
  document.body.innerHTML = ''
})

afterAll(() => {
  // Clean up test database files
  try {
    rmSync(TEST_DB_PATH, { force: true })
    rmSync(TEST_DB_PATH + '-shm', { force: true })
    rmSync(TEST_DB_PATH + '-wal', { force: true })
  } catch (error) {
    // Ignore errors if files don't exist
  }
})