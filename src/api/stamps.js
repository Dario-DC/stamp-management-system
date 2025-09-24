/**
 * Database API Interface for Stamp Management System
 * This module will interface with the backend API to manage stamps and postage rates
 */

class StampAPI {
    constructor(baseUrl = import.meta.env.VITE_API_BASE_URL || '/api') {
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

    // Postage Rates Methods
    async getPostageRates() {
        return this.request('/stamps/postage-rates');
    }

    async addPostageRate(name, rate) {
        return this.request('/stamps/postage-rates', {
            method: 'POST',
            body: JSON.stringify({ name, rate })
        });
    }

    async updateRate(name, rate) {
        return this.request(`/stamps/postage-rates/${encodeURIComponent(name)}`, {
            method: 'PUT',
            body: JSON.stringify({ rate })
        });
    }

    async deleteRate(name) {
        return this.request(`/stamps/postage-rates/${encodeURIComponent(name)}`, {
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

// Helper function to detect if backend is available
async function checkBackendAvailability() {
    try {
        const response = await fetch('/api/stamps/collection', { 
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        return response.ok;
    } catch (error) {
        console.warn('Backend not available, falling back to mock API:', error.message);
        return false;
    }
}

// For development/demo purposes - Mock data when backend is not available
const mockData = {
    collection: [
        { id: 1, name: 'Standard Letter Stamp', val: 120, n: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: 'Priority Mail Stamp', val: 180, n: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, name: 'International Stamp', val: 250, n: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    postageRates: [
        { id: 1, name: 'Standard Letter', rate: 120, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: 'Priority Mail', rate: 180, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, name: 'International Letter', rate: 250, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
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
        } else if (endpoint === '/stamps/postage-rates') {
            if (method === 'GET') {
                return this.data.postageRates;
            } else if (method === 'POST') {
                const existingIndex = this.data.postageRates.findIndex(r => r.name === body.name);
                if (existingIndex !== -1) {
                    this.data.postageRates[existingIndex] = {
                        ...this.data.postageRates[existingIndex],
                        rate: body.rate,
                        updated_at: new Date().toISOString()
                    };
                    return this.data.postageRates[existingIndex];
                } else {
                    const newRate = {
                        id: Math.max(...this.data.postageRates.map(r => r.id)) + 1,
                        ...body,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    this.data.postageRates.push(newRate);
                    return newRate;
                }
            }
        }

        throw new Error(`Mock API: Endpoint ${endpoint} with method ${method} not implemented`);
    }
}

// Auto-detect backend and create appropriate API instance
let api;

// Initialize API based on backend availability
async function initializeAPI() {
    const backendAvailable = await checkBackendAvailability();
    
    if (backendAvailable) {
        console.log('✅ Backend detected - using real API');
        api = new StampAPI();
    } else {
        console.log('🔄 Backend not available - using mock API');
        api = new MockStampAPI();
    }
    
    return api;
}

// Create API instance (will be resolved when first accessed)
const apiPromise = initializeAPI();

// Export a proxy that waits for API initialization
const apiProxy = new Proxy({}, {
    get(target, prop) {
        if (typeof prop === 'string' && typeof StampAPI.prototype[prop] === 'function') {
            return async (...args) => {
                const resolvedApi = await apiPromise;
                return resolvedApi[prop].apply(resolvedApi, args);
            };
        }
        return target[prop];
    }
});

export { StampAPI, MockStampAPI, apiProxy as default, checkBackendAvailability };
