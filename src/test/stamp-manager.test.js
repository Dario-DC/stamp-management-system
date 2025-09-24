/**
 * Integration tests for the StampManager component
 * Tests the actual functionality with comprehensive coverage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import StampManager from '../StampManager.js'

// Mock the API module
vi.mock('../api/stamps.js', () => ({
  default: {
    getStampCollection: vi.fn(),
    getPostageRates: vi.fn(),
    addStampToCollection: vi.fn(),
    addPostageRate: vi.fn(),
    deleteStampFromCollection: vi.fn(),
    deleteRate: vi.fn()
  }
}))

import api from '../api/stamps.js'

describe('StampManager Integration', () => {
  let manager
  let mockStamps
  let mockRates

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '<div id="test-container"></div>'
    
    // Reset all mocks
    vi.clearAllMocks()
    
    // Mock data
    mockStamps = [
      { id: 1, name: 'Test Stamp 1', val: 100, n: 5 },
      { id: 2, name: 'Test Stamp 2', val: 200, n: 3 }
    ]
    
    mockRates = [
      { name: 'Standard', rate: 85 },
      { name: 'Express', rate: 150 }
    ]
    
    // Mock API responses
    api.getStampCollection.mockResolvedValue(mockStamps)
    api.getPostageRates.mockResolvedValue(mockRates)
    api.addStampToCollection.mockResolvedValue({ success: true })
    api.addPostageRate.mockResolvedValue({ success: true })
    api.deleteStampFromCollection.mockResolvedValue({ success: true })
    api.deleteRate.mockResolvedValue({ success: true })
    
    // Mock window.confirm for delete operations
    global.confirm = vi.fn().mockReturnValue(true)
    global.alert = vi.fn()
  })

  afterEach(() => {
    // Clean up global stampManager
    if (window.stampManager === manager) {
      window.stampManager = null
    }
  })

  describe('Initialization', () => {
    it('should create a StampManager instance', () => {
      manager = new StampManager('test-container')
      expect(manager).toBeTruthy()
      expect(manager.container).toBeTruthy()
      expect(manager.stamps).toEqual([])
      expect(manager.rates).toEqual([])
    })

    it('should render the basic UI structure', () => {
      manager = new StampManager('test-container')
      
      const container = document.getElementById('test-container')
      
      // Check for main elements
      expect(container.querySelector('.stamp-manager')).toBeTruthy()
      expect(container.querySelector('h1')).toBeTruthy()
      expect(container.querySelector('.tabs')).toBeTruthy()
      expect(container.querySelector('#stamps-tab')).toBeTruthy()
      expect(container.querySelector('#rates-tab')).toBeTruthy()
      expect(container.querySelector('.api-status')).toBeTruthy()
      expect(container.querySelector('#modal')).toBeTruthy()
    })

    it('should handle missing container gracefully', () => {
      // Since StampManager tries to set innerHTML on null container, it should throw
      expect(() => {
        manager = new StampManager('non-existent-container')
      }).toThrow()
    })
  })

  describe('Data Loading', () => {
    it('should load stamps and rates data on init', async () => {
      manager = new StampManager('test-container')
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(api.getStampCollection).toHaveBeenCalled()
      expect(api.getPostageRates).toHaveBeenCalled()
      expect(manager.stamps).toEqual(mockStamps)
      expect(manager.rates).toEqual(mockRates)
    })

    it('should handle API errors gracefully', async () => {
      api.getStampCollection.mockRejectedValue(new Error('API Error'))
      api.getPostageRates.mockRejectedValue(new Error('API Error'))
      
      manager = new StampManager('test-container')
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Should not throw and should show error state
      const container = document.getElementById('test-container')
      expect(container.querySelector('.error-state')).toBeTruthy()
    })
  })

  describe('UI Rendering', () => {
    beforeEach(async () => {
      manager = new StampManager('test-container')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('should render stamps correctly', () => {
      const container = document.getElementById('test-container')
      const stampsContainer = container.querySelector('#stamps-container')
      
      // Should show stamps
      expect(stampsContainer.innerHTML).toContain('Test Stamp 1')
      expect(stampsContainer.innerHTML).toContain('Test Stamp 2')
      expect(stampsContainer.innerHTML).toContain('€1.00')
      expect(stampsContainer.innerHTML).toContain('€2.00')
    })

    it('should render rates correctly', () => {
      const container = document.getElementById('test-container')
      const ratesContainer = container.querySelector('#rates-container')
      
      // Should show rates
      expect(ratesContainer.innerHTML).toContain('Standard')
      expect(ratesContainer.innerHTML).toContain('Express')
      expect(ratesContainer.innerHTML).toContain('€0.85')
      expect(ratesContainer.innerHTML).toContain('€1.50')
    })

    it('should show empty state when no data', async () => {
      api.getStampCollection.mockResolvedValue([])
      api.getPostageRates.mockResolvedValue([])
      
      manager = new StampManager('test-container')
      await new Promise(resolve => setTimeout(resolve, 0))
      
      const container = document.getElementById('test-container')
      expect(container.innerHTML).toContain('No stamps in collection')
      expect(container.innerHTML).toContain('No postage rates defined')
    })
  })

  describe('Tab Navigation', () => {
    beforeEach(async () => {
      manager = new StampManager('test-container')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('should have tab switching functionality', () => {
      const container = document.getElementById('test-container')
      const stampsTabBtn = container.querySelector('[data-tab="stamps"]')
      const ratesTabBtn = container.querySelector('[data-tab="rates"]')
      
      expect(stampsTabBtn).toBeTruthy()
      expect(ratesTabBtn).toBeTruthy()
      
      // Initially stamps tab should be active
      expect(stampsTabBtn.classList.contains('active')).toBe(true)
      expect(ratesTabBtn.classList.contains('active')).toBe(false)
    })

    it('should switch tabs when clicked', () => {
      const container = document.getElementById('test-container')
      const ratesTabBtn = container.querySelector('[data-tab="rates"]')
      const stampsTab = container.querySelector('#stamps-tab')
      const ratesTab = container.querySelector('#rates-tab')
      
      // Click rates tab
      ratesTabBtn.click()
      
      // Check tab states
      expect(ratesTabBtn.classList.contains('active')).toBe(true)
      expect(ratesTab.classList.contains('active')).toBe(true)
      expect(stampsTab.classList.contains('active')).toBe(false)
    })
  })

  describe('Modal Functionality', () => {
    beforeEach(async () => {
      manager = new StampManager('test-container')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('should open add stamp modal', () => {
      const container = document.getElementById('test-container')
      const addStampBtn = container.querySelector('#add-stamp-btn')
      const modal = container.querySelector('#modal')
      
      addStampBtn.click()
      
      expect(modal.classList.contains('hidden')).toBe(false)
      expect(container.querySelector('#add-stamp-form')).toBeTruthy()
    })

    it('should open add rate modal', () => {
      const container = document.getElementById('test-container')
      const addRateBtn = container.querySelector('#add-rate-btn')
      const modal = container.querySelector('#modal')
      
      addRateBtn.click()
      
      expect(modal.classList.contains('hidden')).toBe(false)
      expect(container.querySelector('#add-rate-form')).toBeTruthy()
    })

    it('should close modal when close button is clicked', () => {
      const container = document.getElementById('test-container')
      const addStampBtn = container.querySelector('#add-stamp-btn')
      const modal = container.querySelector('#modal')
      const closeBtn = container.querySelector('.close')
      
      // Open modal
      addStampBtn.click()
      expect(modal.classList.contains('hidden')).toBe(false)
      
      // Close modal
      closeBtn.click()
      expect(modal.classList.contains('hidden')).toBe(true)
    })
  })

  describe('CRUD Operations', () => {
    beforeEach(async () => {
      manager = new StampManager('test-container')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('should add a new stamp', async () => {
      const container = document.getElementById('test-container')
      const addStampBtn = container.querySelector('#add-stamp-btn')
      
      // Open modal
      addStampBtn.click()
      
      // Fill form
      container.querySelector('#stamp-name').value = 'New Stamp'
      container.querySelector('#stamp-value').value = '1.50'
      container.querySelector('#stamp-quantity').value = '10'
      
      // Submit form
      const form = container.querySelector('#add-stamp-form')
      await form.dispatchEvent(new Event('submit'))
      
      // Check API was called
      expect(api.addStampToCollection).toHaveBeenCalledWith('New Stamp', 150, 10)
    })

    it('should add a new rate', async () => {
      const container = document.getElementById('test-container')
      const addRateBtn = container.querySelector('#add-rate-btn')
      
      // Open modal
      addRateBtn.click()
      
      // Fill form
      container.querySelector('#rate-name').value = 'Priority'
      container.querySelector('#rate-value').value = '2.00'
      
      // Submit form
      const form = container.querySelector('#add-rate-form')
      await form.dispatchEvent(new Event('submit'))
      
      // Check API was called
      expect(api.addPostageRate).toHaveBeenCalledWith('Priority', 200)
    })

    it('should delete stamps when confirmed', async () => {
      // Simulate delete stamp call
      await manager.deleteStamp(1)
      
      expect(global.confirm).toHaveBeenCalled()
      expect(api.deleteStampFromCollection).toHaveBeenCalledWith(1)
    })

    it('should delete rates when confirmed', async () => {
      // Simulate delete rate call
      await manager.deleteRate('Standard')
      
      expect(global.confirm).toHaveBeenCalled()
      expect(api.deleteRate).toHaveBeenCalledWith('Standard')
    })

    it('should not delete when user cancels', async () => {
      global.confirm.mockReturnValue(false)
      
      await manager.deleteStamp(1)
      
      expect(global.confirm).toHaveBeenCalled()
      expect(api.deleteStampFromCollection).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    beforeEach(async () => {
      manager = new StampManager('test-container')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('should handle add stamp errors', async () => {
      api.addStampToCollection.mockRejectedValue(new Error('Add failed'))
      
      const container = document.getElementById('test-container')
      const addStampBtn = container.querySelector('#add-stamp-btn')
      
      addStampBtn.click()
      
      container.querySelector('#stamp-name').value = 'Test'
      container.querySelector('#stamp-value').value = '1.00'
      container.querySelector('#stamp-quantity').value = '1'
      
      const form = container.querySelector('#add-stamp-form')
      await form.dispatchEvent(new Event('submit'))
      
      expect(global.alert).toHaveBeenCalledWith('Failed to add stamp: Add failed')
    })

    it('should handle delete errors', async () => {
      api.deleteStampFromCollection.mockRejectedValue(new Error('Delete failed'))
      
      await manager.deleteStamp(1)
      
      expect(global.alert).toHaveBeenCalledWith('Failed to delete stamp: Delete failed')
    })
  })
})
