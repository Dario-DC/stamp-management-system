/**
 * Stamp Management UI Component
 * Demonstrates the backend API integration
 */

import api from './api/stamps.js';

class StampManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }
        this.stamps = [];
        this.rates = [];
        this.init();
    }

    async init() {
        this.render();
        await this.loadData();
    }

    async loadData() {
        try {
            console.log('Loading data from API...');
            
            // Load stamps and rates concurrently
            const [stamps, rates] = await Promise.all([
                api.getStampCollection(),
                api.getPostageRates()
            ]);
            
            this.stamps = stamps;
            this.rates = rates;
            
            console.log('Data loaded:', { stamps: stamps.length, rates: rates.length });
            this.renderData();
        } catch (error) {
            console.error('Failed to load data:', error);
            this.renderError('Failed to load data from the server');
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="stamp-manager">
                <h1>🏷️ Stamp Management System</h1>
                
                <div class="api-status">
                    <div id="api-status" class="status loading">
                        <span>🔄 Connecting to API...</span>
                    </div>
                </div>

                <div class="tabs">
                    <button class="tab-button active" data-tab="stamps">Stamp Collection</button>
                    <button class="tab-button" data-tab="rates">Postage Rates</button>
                </div>

                <div class="tab-content">
                    <div id="stamps-tab" class="tab-pane active">
                        <div class="section-header">
                            <h2>Stamp Collection</h2>
                            <button id="add-stamp-btn" class="btn btn-primary">Add Stamp</button>
                        </div>
                        <div id="stamps-container" class="data-container">
                            <div class="loading">Loading stamps...</div>
                        </div>
                    </div>

                    <div id="rates-tab" class="tab-pane">
                        <div class="section-header">
                            <h2>Postage Rates</h2>
                            <button id="add-rate-btn" class="btn btn-primary">Add Rate</button>
                        </div>
                        <div id="rates-container" class="data-container">
                            <div class="loading">Loading rates...</div>
                        </div>
                    </div>
                </div>

                <!-- Modal for adding/editing -->
                <div id="modal" class="modal hidden">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <div id="modal-body"></div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Tab switching
        this.container.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Add buttons
        this.container.querySelector('#add-stamp-btn').addEventListener('click', () => {
            this.showAddStampModal();
        });

        this.container.querySelector('#add-rate-btn').addEventListener('click', () => {
            this.showAddRateModal();
        });

        // Modal close
        this.container.querySelector('.close').addEventListener('click', () => {
            this.hideModal();
        });
    }

    switchTab(tabName) {
        // Update buttons
        this.container.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        this.container.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panes
        this.container.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        this.container.querySelector(`#${tabName}-tab`).classList.add('active');
    }

    renderData() {
        this.renderStamps();
        this.renderRates();
        this.updateApiStatus('connected');
    }

    renderStamps() {
        const container = this.container.querySelector('#stamps-container');
        
        if (this.stamps.length === 0) {
            container.innerHTML = '<div class="empty-state">No stamps in collection</div>';
            return;
        }

        container.innerHTML = `
            <div class="data-grid">
                ${this.stamps.map(stamp => `
                    <div class="data-card" data-id="${stamp.id}">
                        <div class="card-header">
                            <h3>${stamp.name}</h3>
                            <div class="card-actions">
                                <button class="btn btn-sm" onclick="stampManager.editStamp(${stamp.id})">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="stampManager.deleteStamp(${stamp.id})">Delete</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <p><strong>Value:</strong> €${(stamp.val / 100).toFixed(2)}</p>
                            <p><strong>Quantity:</strong> ${stamp.n}</p>
                            <p><strong>Total Value:</strong> €${((stamp.val * stamp.n) / 100).toFixed(2)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRates() {
        const container = this.container.querySelector('#rates-container');
        
        if (this.rates.length === 0) {
            container.innerHTML = '<div class="empty-state">No postage rates defined</div>';
            return;
        }

        container.innerHTML = `
            <div class="data-grid">
                ${this.rates.map(rate => `
                    <div class="data-card" data-name="${rate.name}">
                        <div class="card-header">
                            <h3>${rate.name}</h3>
                            <div class="card-actions">
                                <button class="btn btn-sm" onclick="stampManager.editRate('${rate.name}')">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="stampManager.deleteRate('${rate.name}')">Delete</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <p><strong>Rate:</strong> €${(rate.rate / 100).toFixed(2)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateApiStatus(status) {
        const statusEl = this.container.querySelector('#api-status');
        statusEl.className = `status ${status}`;
        
        const messages = {
            loading: '🔄 Connecting to API...',
            connected: '✅ Connected to Backend API',
            mock: '🔄 Using Mock API (Backend unavailable)',
            error: '❌ API Connection Failed'
        };
        
        statusEl.innerHTML = `<span>${messages[status] || messages.error}</span>`;
    }

    renderError(message) {
        this.updateApiStatus('error');
        this.container.querySelector('#stamps-container').innerHTML = 
            `<div class="error-state">❌ ${message}</div>`;
        this.container.querySelector('#rates-container').innerHTML = 
            `<div class="error-state">❌ ${message}</div>`;
    }

    showAddStampModal() {
        const modalBody = this.container.querySelector('#modal-body');
        modalBody.innerHTML = `
            <h3>Add New Stamp</h3>
            <form id="add-stamp-form">
                <div class="form-group">
                    <label for="stamp-name">Name:</label>
                    <input type="text" id="stamp-name" required>
                </div>
                <div class="form-group">
                    <label for="stamp-value">Value (€):</label>
                    <input type="number" id="stamp-value" step="0.01" min="0.01" required>
                </div>
                <div class="form-group">
                    <label for="stamp-quantity">Quantity:</label>
                    <input type="number" id="stamp-quantity" min="1" value="1" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Stamp</button>
                    <button type="button" class="btn" onclick="stampManager.hideModal()">Cancel</button>
                </div>
            </form>
        `;

        this.container.querySelector('#add-stamp-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddStamp(e);
        });

        this.showModal();
    }

    showAddRateModal() {
        const modalBody = this.container.querySelector('#modal-body');
        modalBody.innerHTML = `
            <h3>Add New Postage Rate</h3>
            <form id="add-rate-form">
                <div class="form-group">
                    <label for="rate-name">Name:</label>
                    <input type="text" id="rate-name" required>
                </div>
                <div class="form-group">
                    <label for="rate-value">Rate (€):</label>
                    <input type="number" id="rate-value" step="0.01" min="0.01" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Rate</button>
                    <button type="button" class="btn" onclick="stampManager.hideModal()">Cancel</button>
                </div>
            </form>
        `;

        this.container.querySelector('#add-rate-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddRate(e);
        });

        this.showModal();
    }

    async handleAddStamp(e) {
        try {
            const formData = new FormData(e.target);
            const name = this.container.querySelector('#stamp-name').value;
            const value = Math.round(parseFloat(this.container.querySelector('#stamp-value').value) * 100);
            const quantity = parseInt(this.container.querySelector('#stamp-quantity').value);

            await api.addStampToCollection(name, value, quantity);
            await this.loadData();
            this.hideModal();
        } catch (error) {
            console.error('Failed to add stamp:', error);
            alert('Failed to add stamp: ' + error.message);
        }
    }

    async handleAddRate(e) {
        try {
            const name = this.container.querySelector('#rate-name').value;
            const rate = Math.round(parseFloat(this.container.querySelector('#rate-value').value) * 100);

            await api.addPostageRate(name, rate);
            await this.loadData();
            this.hideModal();
        } catch (error) {
            console.error('Failed to add rate:', error);
            alert('Failed to add rate: ' + error.message);
        }
    }

    async deleteStamp(id) {
        if (confirm('Are you sure you want to delete this stamp?')) {
            try {
                await api.deleteStampFromCollection(id);
                await this.loadData();
            } catch (error) {
                console.error('Failed to delete stamp:', error);
                alert('Failed to delete stamp: ' + error.message);
            }
        }
    }

    async deleteRate(name) {
        if (confirm('Are you sure you want to delete this rate?')) {
            try {
                await api.deleteRate(name);
                await this.loadData();
            } catch (error) {
                console.error('Failed to delete rate:', error);
                alert('Failed to delete rate: ' + error.message);
            }
        }
    }

    showModal() {
        this.container.querySelector('#modal').classList.remove('hidden');
    }

    hideModal() {
        this.container.querySelector('#modal').classList.add('hidden');
    }
}

// Make it globally available for onclick handlers
window.stampManager = null;

export default StampManager;
