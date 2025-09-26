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
                // Try to get error details from response body
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const responseText = await response.text();
                    console.log('Error response body:', responseText);
                    
                    if (responseText) {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.error || errorMessage;
                        if (errorData.details) {
                            const details = errorData.details.map(d => d.msg).join(', ');
                            errorMessage = `${errorMessage}: ${details}`;
                        }
                    }
                } catch (parseError) {
                    console.log('Could not parse error response:', parseError);
                }
                throw new Error(errorMessage);
            }
            
            // Handle empty responses (like 204 No Content)
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null;
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            // Fallback for non-JSON responses
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Stamp Collection Methods
    async getStampCollection() {
        return this.request('/stamps/collection');
    }

    async addStampToCollection(name, value, currency, n = 1, postage_rate_id = null) {
        const body = { name, value, currency, n };
        if (postage_rate_id !== null && postage_rate_id !== undefined) {
            body.postage_rate_id = postage_rate_id;
        }
        return this.request('/stamps/collection', {
            method: 'POST',
            body: JSON.stringify(body)
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

    async addPostageRate(name, value, max_weight) {
        return this.request('/stamps/postage-rates', {
            method: 'POST',
            body: JSON.stringify({ name, value, max_weight })
        });
    }

    async updateRate(name, value, max_weight) {
        return this.request(`/stamps/postage-rates/${encodeURIComponent(name)}`, {
            method: 'PUT',
            body: JSON.stringify({ value, max_weight })
        });
    }

    async deleteRate(name) {
        return this.request(`/stamps/postage-rates/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
    }

    // Additional methods for the updated schema
    async getStampById(id) {
        return this.request(`/stamps/collection/${id}`);
    }

    async updateStamp(id, name, value, currency, n, postage_rate_id = null) {
        return this.request(`/stamps/collection/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name, value, currency, n, postage_rate_id })
        });
    }

    async getStampsByCurrency(currency) {
        return this.request(`/stamps/collection/currency/${currency}`);
    }

    async getCollectionStats() {
        return this.request('/stamps/stats');
    }

    async getTotalCollectionValue() {
        return this.request('/stamps/value');
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

    /**
     * Helper method to convert ITL to EUR
     */
    itlToEur(itlValue) {
        return itlValue / 1936.27;
    }

    /**
     * Helper method to convert EUR to ITL
     */
    eurToItl(eurValue) {
        return eurValue * 1936.27;
    }

    /**
     * Helper method to calculate euro_cents from value and currency
     */
    calculateEuroCents(value, currency) {
        if (currency === 'EUR') {
            return Math.round(value * 100);
        } else if (currency === 'ITL') {
            return Math.round((value / 1936.27) * 100);
        }
        throw new Error('Invalid currency. Must be EUR or ITL');
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
        { id: 1, name: 'Standard Letter Stamp', value: 1.20, currency: 'EUR', euro_cents: 120, n: 50, postage_rate_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: 'Priority Mail Stamp', value: 1.80, currency: 'EUR', euro_cents: 180, n: 25, postage_rate_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, name: 'International Stamp', value: 2.50, currency: 'EUR', euro_cents: 250, n: 15, postage_rate_id: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, name: 'Vintage Italian Stamp', value: 500, currency: 'ITL', euro_cents: 26, n: 10, postage_rate_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ],
    postageRates: [
        { id: 1, name: 'Standard Letter', value: 1.20, max_weight: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: 'Priority Mail', value: 1.80, max_weight: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, name: 'International Letter', value: 2.50, max_weight: 20, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ]
};

// Mock API for development
class MockStampAPI extends StampAPI {
    constructor() {
        super();
        this.data = JSON.parse(JSON.stringify(mockData)); // Deep copy
    }

    calculateEuroCents(value, currency) {
        if (currency === 'EUR') {
            return Math.round(value * 100);
        } else if (currency === 'ITL') {
            return Math.round((value / 1936.27) * 100);
        }
        throw new Error('Invalid currency. Must be EUR or ITL');
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
                    id: this.data.collection.length > 0 ? Math.max(...this.data.collection.map(s => s.id)) + 1 : 1,
                    ...body,
                    euro_cents: this.calculateEuroCents(body.value, body.currency),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                this.data.collection.push(newStamp);
                return newStamp;
            }
        } else if (endpoint.startsWith('/stamps/collection/currency/')) {
            const currency = endpoint.split('/').pop().toUpperCase();
            return this.data.collection.filter(s => s.currency === currency);
        } else if (endpoint.startsWith('/stamps/collection/')) {
            const id = parseInt(endpoint.split('/').pop());
            const stampIndex = this.data.collection.findIndex(s => s.id === id);
            
            if (method === 'GET' && stampIndex !== -1) {
                return this.data.collection[stampIndex];
            } else if (method === 'PUT' && stampIndex !== -1) {
                this.data.collection[stampIndex] = {
                    ...this.data.collection[stampIndex],
                    ...body,
                    updated_at: new Date().toISOString()
                };
                return this.data.collection[stampIndex];
            } else if (method === 'PATCH' && stampIndex !== -1) {
                this.data.collection[stampIndex] = {
                    ...this.data.collection[stampIndex],
                    ...body,
                    euro_cents: this.calculateEuroCents(body.value, body.currency),
                    updated_at: new Date().toISOString()
                };
                return this.data.collection[stampIndex];
            } else if (method === 'DELETE' && stampIndex !== -1) {
                return this.data.collection.splice(stampIndex, 1)[0];
            }
        } else if (endpoint === '/stamps/stats') {
            const totalStamps = this.data.collection.reduce((sum, s) => sum + s.n, 0);
            const uniqueStamps = this.data.collection.length;
            const totalValueCents = this.data.collection.reduce((sum, s) => sum + (s.euro_cents * s.n), 0);
            const currencyBreakdown = this.data.collection.reduce((acc, s) => {
                if (!acc[s.currency]) {
                    acc[s.currency] = { count: 0, total_quantity: 0, total_value_cents: 0 };
                }
                acc[s.currency].count++;
                acc[s.currency].total_quantity += s.n;
                acc[s.currency].total_value_cents += s.euro_cents * s.n;
                return acc;
            }, {});
            
            return {
                total_stamps: totalStamps,
                unique_stamps: uniqueStamps,
                total_value_cents: totalValueCents,
                total_value_euros: totalValueCents / 100,
                currency_breakdown: Object.entries(currencyBreakdown).map(([currency, data]) => ({
                    currency,
                    ...data
                }))
            };
        } else if (endpoint === '/stamps/value') {
            const totalValueCents = this.data.collection.reduce((sum, s) => sum + (s.euro_cents * s.n), 0);
            return { total_value_cents: totalValueCents };
        } else if (endpoint === '/stamps/postage-rates') {
            if (method === 'GET') {
                return this.data.postageRates;
            } else if (method === 'POST') {
                const existingIndex = this.data.postageRates.findIndex(r => r.name === body.name);
                if (existingIndex !== -1) {
                    this.data.postageRates[existingIndex] = {
                        ...this.data.postageRates[existingIndex],
                        value: body.value,
                        max_weight: body.max_weight,
                        updated_at: new Date().toISOString()
                    };
                    return this.data.postageRates[existingIndex];
                } else {
                    const newRate = {
                        id: this.data.postageRates.length > 0 ? Math.max(...this.data.postageRates.map(r => r.id)) + 1 : 1,
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
