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
                                <button class="btn btn-sm btn-danger" onclick="stampManager.showDeleteModal(${stamp.id}, '${stamp.name}', ${stamp.n})">Delete</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <p><strong>Quantity:</strong> ${stamp.n}</p>
                            <p><strong>Total Value (EUR):</strong> €${stamp.currency === 'ITL' ? 
                                ((stamp.value * stamp.n) / 1936.27).toFixed(2) : 
                                stamp.euro_cents ? ((stamp.euro_cents * stamp.n) / 100).toFixed(2) : 
                                ((stamp.value * stamp.n)).toFixed(2)}</p>
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
                                <button class="btn btn-sm btn-danger" onclick="stampManager.deleteRate('${rate.name}')">Delete</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <p><strong>Rate:</strong> €${rate.value ? rate.value.toFixed(2) : '0.00'}</p>
                            <p><strong>Max Weight:</strong> ${rate.max_weight || 'N/A'} grams</p>
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
            
            <!-- Currency Type Selection -->
            <div class="form-group">
                <label>Currency Type:</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="currency-type" value="EUR" checked>
                        <span>Euro (€)</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="currency-type" value="ITL">
                        <span>Lire (₤)</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="currency-type" value="POSTAGE_RATE">
                        <span>Postage Rate</span>
                    </label>
                </div>
            </div>

            <form id="add-stamp-form">
                <!-- Euro/Lire Fields -->
                <div id="currency-fields" class="entry-fields">
                    <div class="form-group">
                        <label for="stamp-value">Value (€):</label>
                        <input type="number" id="stamp-value" step="0.01" min="0.01" placeholder="0.00" required>
                        <small id="currency-hint">Enter value in Euros (e.g., 2.50 for €2.50)</small>
                    </div>
                </div>

                <!-- Postage Rate Selection Fields -->
                <div id="postage-rate-fields" class="entry-fields hidden">
                    <div class="form-group">
                        <label for="postage-rate-select">Select Postage Rate:</label>
                        <select id="postage-rate-select">
                            <option value="">-- Select a postage rate --</option>
                            ${this.rates.map(rate => `
                                <option value="${rate.name}" data-value="${rate.value}" data-id="${rate.id}">
                                    ${rate.name} - €${rate.value ? rate.value.toFixed(2) : '0.00'}
                                </option>
                            `).join('')}
                        </select>
                        <small>The stamp name and value will be set based on the selected rate</small>
                    </div>
                </div>

                <!-- Common Fields -->
                <div class="form-group">
                    <label for="stamp-quantity">Quantity:</label>
                    <input type="number" id="stamp-quantity" min="1" value="1" placeholder="1" required>
                    <small>Number of stamps to add to collection</small>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Stamp</button>
                    <button type="button" class="btn" onclick="stampManager.hideModal()">Cancel</button>
                </div>
            </form>
        `;

        this.setupAddStampModalListeners();
        this.showModal();
    }

    setupAddStampModalListeners() {
        const form = this.container.querySelector('#add-stamp-form');
        const currencyTypeRadios = this.container.querySelectorAll('input[name="currency-type"]');
        const currencyFields = this.container.querySelector('#currency-fields');
        const postageRateFields = this.container.querySelector('#postage-rate-fields');
        const stampValueInput = this.container.querySelector('#stamp-value');
        const postageRateSelect = this.container.querySelector('#postage-rate-select');

        // Handle currency type changes
        currencyTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const currencyType = e.target.value;
                const hint = this.container.querySelector('#currency-hint');
                const valueLabel = this.container.querySelector('label[for="stamp-value"]');
                
                if (currencyType === 'POSTAGE_RATE') {
                    // Show postage rate fields, hide currency fields
                    currencyFields.classList.add('hidden');
                    postageRateFields.classList.remove('hidden');
                    
                    // Update required fields
                    stampValueInput.required = false;
                    postageRateSelect.required = true;
                    
                    // Clear value field
                    stampValueInput.value = '';
                } else {
                    // Show currency fields, hide postage rate fields
                    currencyFields.classList.remove('hidden');
                    postageRateFields.classList.add('hidden');
                    
                    // Update required fields
                    stampValueInput.required = true;
                    postageRateSelect.required = false;
                    postageRateSelect.value = '';
                    
                    // Update field based on currency type
                    if (currencyType === 'ITL') {
                        hint.textContent = 'Enter value in Italian Lire (e.g., 500 for L. 500)';
                        valueLabel.textContent = 'Value (₤):';
                        // Change input to only allow integers for Italian Lira
                        stampValueInput.step = '1';
                        stampValueInput.min = '1';
                        stampValueInput.placeholder = '500';
                        // Clear current value if it's decimal to avoid confusion
                        if (stampValueInput.value && stampValueInput.value.includes('.')) {
                            stampValueInput.value = '';
                        }
                    } else {
                        hint.textContent = 'Enter value in Euros (e.g., 2.50 for €2.50)';
                        valueLabel.textContent = 'Value (€):';
                        // Change input to allow decimals for Euros
                        stampValueInput.step = '0.01';
                        stampValueInput.min = '0.01';
                        stampValueInput.placeholder = '0.00';
                    }
                }
            });
        });

        // Handle postage rate selection (for postage rate)
        postageRateSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if (selectedOption && selectedOption.value) {
                // Auto-fill value with the rate value (for display purposes)
                const rateValue = selectedOption.getAttribute('data-value');
                stampValueInput.value = rateValue;
            }
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddStamp(e);
        });

        // Initialize the form state - EUR is checked by default
        stampValueInput.required = true;
        postageRateSelect.required = false;
    }

    showAddRateModal() {
        const modalBody = this.container.querySelector('#modal-body');
        modalBody.innerHTML = `
            <h3>Add New Postage Rate</h3>
            <form id="add-rate-form">
                <div class="form-group">
                    <label for="rate-name">Rate Name:</label>
                    <input type="text" id="rate-name" placeholder="Enter rate name (e.g., 'Standard Letter')" required>
                </div>
                <div class="form-group">
                    <label for="rate-value">Rate (€):</label>
                    <input type="number" id="rate-value" step="0.01" min="0.01" placeholder="0.00" required>
                    <small>Postage cost in euros</small>
                </div>
                <div class="form-group">
                    <label for="rate-weight">Max Weight (grams):</label>
                    <input type="number" id="rate-weight" min="1" value="20" placeholder="20" required>
                    <small>Maximum weight for this postage rate</small>
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
            const currencyType = this.container.querySelector('input[name="currency-type"]:checked').value;
            const quantity = parseInt(this.container.querySelector('#stamp-quantity').value);
            
            // Basic quantity validation
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error('Valid quantity is required');
            }

            let name, value, currency, postageRateId = null;

            if (currencyType === 'POSTAGE_RATE') {
                // Postage rate selection
                const postageRateSelect = this.container.querySelector('#postage-rate-select');
                const selectedRateName = postageRateSelect.value;
                
                if (!selectedRateName) {
                    throw new Error('Please select a postage rate');
                }

                // Get the selected option to access data attributes
                const selectedOption = postageRateSelect.selectedOptions[0];
                const rateId = selectedOption.getAttribute('data-id');
                const rateValue = selectedOption.getAttribute('data-value');

                if (!rateId) {
                    throw new Error('Selected postage rate ID not found');
                }

                name = selectedRateName;
                value = parseFloat(rateValue);
                currency = 'EUR'; // Postage rates are always in EUR
                postageRateId = parseInt(rateId); // Use the numeric ID from the database
            } else {
                // Euro or Lire entry
                const inputValue = parseFloat(this.container.querySelector('#stamp-value').value);
                
                if (isNaN(inputValue) || inputValue <= 0) {
                    throw new Error('Valid stamp value is required');
                }

                value = inputValue;
                currency = currencyType; // 'EUR' or 'ITL'
                
                // Generate name from value based on currency
                if (currencyType === 'EUR') {
                    name = `€${value.toFixed(2)}`;
                } else { // ITL
                    name = `₤${Math.round(value)}`;
                }
            }

            console.log('Adding stamp with data:', { name, value, currency, quantity, postageRateId });
            
            // Call API with postage_rate_id if applicable
            await api.addStampToCollection(name, value, currency, quantity, postageRateId);
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
            const value = parseFloat(this.container.querySelector('#rate-value').value);
            const maxWeight = parseInt(this.container.querySelector('#rate-weight').value) || 20;

            await api.addPostageRate(name, value, maxWeight);
            await this.loadData();
            this.hideModal();
        } catch (error) {
            console.error('Failed to add rate:', error);
            alert('Failed to add rate: ' + error.message);
        }
    }

    showDeleteModal(id, name, currentQuantity) {
        // If there's only one stamp, show simple confirmation
        if (currentQuantity === 1) {
            if (confirm(`Are you sure you want to delete the stamp "${name}"?`)) {
                this.deleteStamp(id, name, currentQuantity, 1);
            }
            return;
        }

        // For multiple stamps, show quantity selection modal
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h2>Delete Stamps</h2>
            <form id="delete-form">
                <div class="form-group">
                    <label>Stamp: <strong>${name}</strong></label>
                    <p>Current quantity: <strong>${currentQuantity}</strong></p>
                </div>
                
                <div class="form-group">
                    <label for="delete-quantity">Quantity to delete:</label>
                    <input type="number" id="delete-quantity" min="1" max="${currentQuantity}" value="1" required>
                    <small>Enter the number of stamps to delete (max: ${currentQuantity})</small>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-danger">Delete Stamps</button>
                    <button type="button" class="btn btn-secondary" onclick="stampManager.hideModal()">Cancel</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        // Handle form submission
        document.getElementById('delete-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const quantityToDelete = parseInt(document.getElementById('delete-quantity').value);
            await this.deleteStamp(id, name, currentQuantity, quantityToDelete);
        });
    }

    async deleteStamp(id, name, currentQuantity, quantityToDelete) {
        try {
            if (quantityToDelete >= currentQuantity) {
                // Delete the entire stamp entry
                await api.deleteStampFromCollection(id);
            } else {
                // Update the stamp quantity by subtracting the deleted amount
                const newQuantity = currentQuantity - quantityToDelete;
                await api.updateStampQuantity(id, newQuantity);
            }
            
            this.hideModal();
            await this.loadData();
        } catch (error) {
            console.error('Failed to delete stamp:', error);
            alert('Failed to delete stamp: ' + error.message);
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
