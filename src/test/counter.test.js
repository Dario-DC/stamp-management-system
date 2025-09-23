import { describe, it, expect, beforeEach } from 'vitest'
import { setupCounter } from '../counter.js'

describe('Counter', () => {
  let buttonElement

  beforeEach(() => {
    // Create a button element for testing
    buttonElement = document.createElement('button')
    document.body.appendChild(buttonElement)
  })

  it('should initialize counter with 0', () => {
    setupCounter(buttonElement)
    expect(buttonElement.innerHTML).toBe('count is 0')
  })

  it('should increment counter when clicked', () => {
    setupCounter(buttonElement)
    
    // Initial state
    expect(buttonElement.innerHTML).toBe('count is 0')
    
    // Click the button
    buttonElement.click()
    expect(buttonElement.innerHTML).toBe('count is 1')
    
    // Click again
    buttonElement.click()
    expect(buttonElement.innerHTML).toBe('count is 2')
  })

  it('should handle multiple clicks correctly', () => {
    setupCounter(buttonElement)
    
    // Click multiple times
    for (let i = 0; i < 5; i++) {
      buttonElement.click()
    }
    
    expect(buttonElement.innerHTML).toBe('count is 5')
  })
})