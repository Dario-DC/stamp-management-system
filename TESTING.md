# Testing Guide

This project uses [Vitest](https://vitest.dev/) for testing, along with jsdom for DOM testing.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage (requires @vitest/coverage-* package)
npm run test:coverage
```

## Test Structure

- `src/test/` - Main test directory
- `src/test/setup.js` - Test setup and configuration
- `src/test/*.test.js` - Individual test files

## Writing Tests

### Basic Test Example

```javascript
import { describe, it, expect } from 'vitest'

describe('Feature Name', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

### DOM Testing Example

```javascript
import { describe, it, expect, beforeEach } from 'vitest'

describe('DOM Component', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should create element', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    
    expect(document.querySelector('div')).toBeTruthy()
  })
})
```

## Test Files

- `counter.test.js` - Tests for the counter functionality
- `main.test.js` - Tests for main application setup
- `stamp-management.test.js` - Placeholder tests for future stamp management features

## Configuration

The test configuration is in `vitest.config.js` and includes:
- jsdom environment for DOM testing
- Global test APIs (describe, it, expect)
- Setup file for test initialization