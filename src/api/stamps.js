/**
 * Database API Interface for Stamp Management System
 * This module will interface with the backend API to manage stamps and tariffs
 */

class StampAPI {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Stamp Collection Methods
    async getStampCollection() {
        return this.request('/stamps/collection');
    }

    async addStampToCollection(name, val, n = 1) {
        return this.request('/stamps/collection', {
            method: 'POST',
            body: JSON.stringify({ name, val, n })
        });
    }

    async updateStampQuantity(id, quantity) {
        return this.request(`/stamps/collection/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ n: quantity })
        });
    }

    async deleteStampFromCollection(id) {
        return this.request(`/stamps/collection/${id}`, {
            method: 'DELETE'
        });
    }

    // Stamp Tariffs Methods
    async getStampTariffs() {
        return this.request('/stamps/tariffs');
    }

    async addStampTariff(name, tariff) {
        return this.request('/stamps/tariffs', {
            method: 'POST',
            body: JSON.stringify({ name, tariff })
        });
    }

    async updateTariff(name, tariff) {
        return this.request(`/stamps/tariffs/${encodeURIComponent(name)}`, {
            method: 'PUT',
            body: JSON.stringify({ tariff })
        });
    }

    async deleteTariff(name) {
        return this.request(`/stamps/tariffs/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
    }

    /**
     * Helper method to format currency values
     */
    formatCurrency(cents) {
        return `€${(cents / 100).toFixed(2)}`;
    }

    /**
     * Helper method to convert euros to cents
     */
    eurosToCents(euros) {
        return Math.round(euros * 100);
    }

    /**
     * Helper method to convert cents to euros
     */
    centsToEuros(cents) {
        return cents / 100;
    }
}

// Create a global API instance
const stampAPI = new StampAPI();

// For development/demo purposes - Mock data when backend is not available
const mockData = {
    collection: [
        { id: 1, name: 'Standard Letter Stamp', val: 120, n: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: 'Priority Mail Stamp', val: 180, n: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, name: 'International Stamp', val: 250, n: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    tariffs: [
        { id: 1, name: 'Standard Letter', tariff: 120, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: 'Priority Mail', tariff: 180, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, name: 'International Letter', tariff: 250, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ]
};

// Mock API for development
class MockStampAPI extends StampAPI {
    constructor() {
        super();
        this.data = JSON.parse(JSON.stringify(mockData)); // Deep copy
    }

    async request(endpoint, options = {}) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;

        if (endpoint === '/stamps/collection') {
            if (method === 'GET') {
                return this.data.collection;
            } else if (method === 'POST') {
                const newStamp = {
                    id: Math.max(...this.data.collection.map(s => s.id)) + 1,
                    ...body,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                this.data.collection.push(newStamp);
                return newStamp;
            }
        } else if (endpoint.startsWith('/stamps/collection/')) {
            const id = parseInt(endpoint.split('/').pop());
            const stampIndex = this.data.collection.findIndex(s => s.id === id);
            
            if (method === 'PUT' && stampIndex !== -1) {
                this.data.collection[stampIndex] = {
                    ...this.data.collection[stampIndex],
                    ...body,
                    updated_at: new Date().toISOString()
                };
                return this.data.collection[stampIndex];
            } else if (method === 'DELETE' && stampIndex !== -1) {
                return this.data.collection.splice(stampIndex, 1)[0];
            }
        } else if (endpoint === '/stamps/tariffs') {
            if (method === 'GET') {
                return this.data.tariffs;
            } else if (method === 'POST') {
                const existingIndex = this.data.tariffs.findIndex(t => t.name === body.name);
                if (existingIndex !== -1) {
                    this.data.tariffs[existingIndex] = {
                        ...this.data.tariffs[existingIndex],
                        tariff: body.tariff,
                        updated_at: new Date().toISOString()
                    };
                    return this.data.tariffs[existingIndex];
                } else {
                    const newTariff = {
                        id: Math.max(...this.data.tariffs.map(t => t.id)) + 1,
                        ...body,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    this.data.tariffs.push(newTariff);
                    return newTariff;
                }
            }
        }

        throw new Error(`Mock API: Endpoint ${endpoint} with method ${method} not implemented`);
    }
}

// Use mock API for development
const api = new MockStampAPI();

export { StampAPI, MockStampAPI, api as default };
