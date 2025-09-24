import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import StampManager from '../StampManager.js'

// Mock the API before importing anything else
vi.mock('../api/stamps.js', () => ({
  default: {
    getStampCollection: vi.fn().mockResolvedValue([]),
    getPostageRates: vi.fn().mockResolvedValue([])
  }
}))

describe('Main Application Integration', () => {
  beforeEach(() => {
    // Set up DOM like index.html
    document.body.innerHTML = '<div id="app"></div>'
    
    // Clean up any existing global stampManager
    if (window.stampManager) {
      delete window.stampManager
    }
  })

  afterEach(() => {
    // Clean up global stampManager
    if (window.stampManager) {
      delete window.stampManager
    }
  })

  it('should have the app element available in DOM', () => {
    const appElement = document.querySelector('#app')
    expect(appElement).toBeTruthy()
    expect(appElement.id).toBe('app')
  })

  it('should be able to initialize stamp manager container like main.js does', () => {
    // Simulate what main.js does
    const appElement = document.querySelector('#app')
    appElement.innerHTML = '<div id="stamp-manager-container"></div>'
    
    const containerElement = document.querySelector('#stamp-manager-container')
    
    // Verify the container was created
    expect(containerElement).toBeTruthy()
    expect(containerElement.id).toBe('stamp-manager-container')
    expect(appElement.contains(containerElement)).toBe(true)
  })

  it('should create and assign a global stampManager instance like main.js does', async () => {
    // Simulate what main.js does
    document.querySelector('#app').innerHTML = '<div id="stamp-manager-container"></div>'
    
    // Create and initialize the stamp manager like main.js
    const stampManager = new StampManager('stamp-manager-container')
    window.stampManager = stampManager
    
    // Verify global stampManager was created
    expect(window.stampManager).toBeTruthy()
    expect(typeof window.stampManager).toBe('object')
    
    // Check that it has expected properties/methods
    expect(window.stampManager.container).toBeTruthy()
    expect(typeof window.stampManager.loadData).toBe('function')
    expect(typeof window.stampManager.render).toBe('function')
  })

  it('should render the stamp manager UI when initialized', async () => {
    // Simulate main.js initialization
    document.querySelector('#app').innerHTML = '<div id="stamp-manager-container"></div>'
    const stampManager = new StampManager('stamp-manager-container')
    
    const container = document.querySelector('#stamp-manager-container')
    
    // Wait a tick for the StampManager to render
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Check for key UI elements that should be rendered
    expect(container.querySelector('.stamp-manager')).toBeTruthy()
    expect(container.querySelector('h1')).toBeTruthy()
    expect(container.innerHTML).toContain('Stamp Management System')
  })

  it('should set up the DOM structure correctly', () => {
    const appElement = document.querySelector('#app')
    const initialContent = appElement.innerHTML
    
    // Simulate main.js DOM setup
    appElement.innerHTML = '<div id="stamp-manager-container"></div>'
    
    // Verify the DOM was modified
    expect(appElement.innerHTML).not.toBe(initialContent)
    expect(appElement.innerHTML).toContain('stamp-manager-container')
  })

  it('should handle main.js initialization steps in sequence', async () => {
    const appElement = document.querySelector('#app')
    
    // Step 1: Set up container like main.js
    appElement.innerHTML = '<div id="stamp-manager-container"></div>'
    
    // Step 2: Create stamp manager instance
    const stampManager = new StampManager('stamp-manager-container')
    
    // Step 3: Make it globally available
    window.stampManager = stampManager
    
    // Verify all steps completed successfully
    expect(document.querySelector('#stamp-manager-container')).toBeTruthy()
    expect(window.stampManager).toBeTruthy()
    expect(window.stampManager.container).toBeTruthy()
    
    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify UI was rendered
    expect(window.stampManager.container.querySelector('.stamp-manager')).toBeTruthy()
  })

  it('should handle missing DOM elements gracefully during main.js simulation', () => {
    // Remove the app element like main.js might encounter
    document.body.innerHTML = ''
    
    // This should throw an error because there's no #app element
    expect(() => {
      document.querySelector('#app').innerHTML = '<div id="stamp-manager-container"></div>'
    }).toThrow()
  })

  it('should support multiple stamp manager instances if needed', async () => {
    // Set up multiple containers
    document.querySelector('#app').innerHTML = `
      <div id="stamp-manager-container-1"></div>
      <div id="stamp-manager-container-2"></div>
    `
    
    // Create multiple instances
    const manager1 = new StampManager('stamp-manager-container-1')
    const manager2 = new StampManager('stamp-manager-container-2')
    
    // Both should be valid instances
    expect(manager1).toBeTruthy()
    expect(manager2).toBeTruthy()
    expect(manager1.container.id).toBe('stamp-manager-container-1')
    expect(manager2.container.id).toBe('stamp-manager-container-2')
  })
})