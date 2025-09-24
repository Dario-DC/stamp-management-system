import './style.css'
import StampManager from './StampManager.js'

// Initialize the Stamp Management System
document.querySelector('#app').innerHTML = '<div id="stamp-manager-container"></div>';

// Create and initialize the stamp manager
const stampManager = new StampManager('stamp-manager-container');

// Make it globally available for event handlers
window.stampManager = stampManager;
