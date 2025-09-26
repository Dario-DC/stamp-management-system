/**
 * Database Initialization Tests
 * Tests to ensure proper database setup and initial state
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { app, db } from '../../backend/server.js';

let server;
let API_BASE_URL;

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    if (options.expectJson !== false) {
        const data = await response.json();
        return { response, data };
    }
    
    return { response };
}

describe('Database Initialization Tests', () => {
    beforeEach(async () => {
        // Start test server on a random available port for each test
        return new Promise((resolve, reject) => {
            server = app.listen(0, 'localhost', () => {
                const port = server.address().port;
                API_BASE_URL = `http://localhost:${port}`;
                resolve();
            });
            
            server.on('error', reject);
        });
    });

    afterEach(async () => {
        // Close the test server
        if (server) {
            await new Promise((resolve) => {
                server.close(resolve);
            });
        }
    });

    it('should initialize with postage rates but empty stamps table', async () => {
        // Check postage rates are initialized
        const { response: ratesResponse, data: rates } = await apiRequest('/api/stamps/postage-rates');
        
        expect(ratesResponse.status).toBe(200);
        expect(Array.isArray(rates)).toBe(true);
        expect(rates.length).toBeGreaterThan(0);
        
        // Verify specific postage rates exist
        const rateNames = rates.map(rate => rate.name);
        expect(rateNames).toContain('A');
        expect(rateNames).toContain('B');
        expect(rateNames).toContain('A1');
        expect(rateNames).toContain('B1');
        
        // Check that stamps table is empty
        const { response: stampsResponse, data: stamps } = await apiRequest('/api/stamps/collection');
        
        expect(stampsResponse.status).toBe(200);
        expect(Array.isArray(stamps)).toBe(true);
        expect(stamps.length).toBe(0); // Should be empty on fresh initialization
    });

    it('should maintain postage rates structure correctly', async () => {
        const { response: ratesResponse, data: rates } = await apiRequest('/api/stamps/postage-rates');
        
        expect(ratesResponse.status).toBe(200);
        
        // Check that all rates have required fields
        rates.forEach(rate => {
            expect(rate).toHaveProperty('id');
            expect(rate).toHaveProperty('name');
            expect(rate).toHaveProperty('value');
            expect(rate).toHaveProperty('max_weight');
            expect(rate).toHaveProperty('created_at');
            expect(rate).toHaveProperty('updated_at');
            
            // Verify data types
            expect(typeof rate.id).toBe('number');
            expect(typeof rate.name).toBe('string');
            expect(typeof rate.value).toBe('number');
            expect(typeof rate.max_weight).toBe('number');
        });
    });

    it('should allow adding stamps to collection regardless of initial state', async () => {
        // This test verifies that we can successfully add stamps to the collection
        // Add a test stamp
        const newStamp = {
            name: 'Test Initialization Stamp Unique',
            value: 2.50,
            currency: 'EUR',
            n: 3
        };

        const { response: addResponse, data: addedStamp } = await apiRequest('/api/stamps/collection', {
            method: 'POST',
            body: JSON.stringify(newStamp)
        });

        expect(addResponse.status).toBe(201);
        expect(addedStamp).toHaveProperty('id');
        expect(addedStamp.name).toBe(newStamp.name);
        expect(addedStamp.value).toBe(newStamp.value);
        expect(addedStamp.currency).toBe(newStamp.currency);
        expect(addedStamp.n).toBe(newStamp.n);
        
        // Verify the stamp appears in the collection
        const { data: stamps } = await apiRequest('/api/stamps/collection');
        const foundStamp = stamps.find(s => s.name === newStamp.name);
        expect(foundStamp).toBeDefined();
        expect(foundStamp.name).toBe(newStamp.name);
    });

    it('should calculate euro_cents correctly for different currencies', async () => {
        // Add EUR stamp
        const eurStamp = {
            name: 'EUR Test Stamp',
            value: 1.50,
            currency: 'EUR',
            n: 1
        };

        const { data: addedEurStamp } = await apiRequest('/api/stamps/collection', {
            method: 'POST',
            body: JSON.stringify(eurStamp)
        });

        expect(addedEurStamp.euro_cents).toBe(150); // 1.50 EUR = 150 cents

        // Add ITL stamp
        const itlStamp = {
            name: 'ITL Test Stamp',
            value: 1936.27, // Should convert to 1 EUR
            currency: 'ITL',
            n: 1
        };

        const { data: addedItlStamp } = await apiRequest('/api/stamps/collection', {
            method: 'POST',
            body: JSON.stringify(itlStamp)
        });

        expect(addedItlStamp.euro_cents).toBe(100); // 1936.27 ITL ≈ 100 cents
    });
});
