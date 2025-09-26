// Backend test setup file
import { beforeAll, afterAll, beforeEach } from 'vitest'
import { rmSync, readFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

// Set up test database path for backend tests
const TEST_DB_PATH = './database/backend_test_stamps.db'
process.env.STAMP_DB_PATH = TEST_DB_PATH

beforeAll(() => {
  // Ensure test database directory exists
  mkdirSync(dirname(TEST_DB_PATH), { recursive: true })
})

beforeEach(() => {
  // Clean up test database before each test
  try {
    rmSync(TEST_DB_PATH, { force: true })
    rmSync(TEST_DB_PATH + '-shm', { force: true })
    rmSync(TEST_DB_PATH + '-wal', { force: true })
  } catch (error) {
    // Ignore errors if files don't exist
  }

  // Initialize fresh test database - will be handled by StampDatabase constructor
  // The database constructor will read schema and init_data automatically
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
