import { describe, it, expect, beforeEach } from 'vitest'

describe('Main Application', () => {
  beforeEach(() => {
    // Set up a basic DOM structure
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('should have an app element in the DOM', () => {
    const appElement = document.querySelector('#app')
    expect(appElement).toBeTruthy()
  })

  it('should be able to set innerHTML on app element', () => {
    const appElement = document.querySelector('#app')
    appElement.innerHTML = '<h1>Test Content</h1>'
    
    expect(appElement.innerHTML).toBe('<h1>Test Content</h1>')
    expect(appElement.querySelector('h1')).toBeTruthy()
    expect(appElement.querySelector('h1').textContent).toBe('Test Content')
  })
})