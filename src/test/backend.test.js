/**
 * Backend Integration Tests for Stamp Management System
 * Tests the Node.js Express API endpoints via HTTP requests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
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

describe('Stamp Management API Integration Tests', () => {
    beforeAll(async () => {
        // Start test server on a random available port
        return new Promise((resolve, reject) => {
            server = app.listen(0, 'localhost', () => {
                const port = server.address().port;
                API_BASE_URL = `http://localhost:${port}`;
                console.log(`Test server started on ${API_BASE_URL}`);
                resolve();
            });
            
            server.on('error', reject);
        });
    });

    afterAll(async () => {
        // Close the test server and database
        if (server) {
            await new Promise((resolve) => {
                server.close(resolve);
            });
        }
        if (db) {
            db.close();
        }
    });

    describe('Health Check', () => {
        it('should return health status', async () => {
            const { response, data } = await apiRequest('/health');

            expect(response.status).toBe(200);
            expect(data).toHaveProperty('status', 'healthy');
            expect(data).toHaveProperty('timestamp');
            expect(data).toHaveProperty('version');
        });
    });

    describe('Stamp Collection API', () => {
        it('should get all stamps', async () => {
            const { response, data } = await apiRequest('/api/stamps/collection');

            expect(response.status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        });

        it('should add a new stamp', async () => {
            const newStamp = {
                name: 'Test Stamp Vitest',
                value: 1.00,
                currency: 'EUR',
                n: 5
            };

            const { response, data } = await apiRequest('/api/stamps/collection', {
                method: 'POST',
                body: JSON.stringify(newStamp)
            });

            expect(response.status).toBe(201);
            expect(data).toHaveProperty('id');
            expect(data.name).toBe(newStamp.name);
            expect(data.value).toBe(newStamp.value);
            expect(data.currency).toBe(newStamp.currency);
            expect(data.n).toBe(newStamp.n);
        });

        it('should update stamp quantity', async () => {
            // First add a stamp
            const { data: newStamp } = await apiRequest('/api/stamps/collection', {
                method: 'POST',
                body: JSON.stringify({ name: 'Update Test Vitest', value: 1.50, currency: 'EUR', n: 10 })
            });

            const stampId = newStamp.id;
            const newQuantity = 20;

            const { response, data } = await apiRequest(`/api/stamps/collection/${stampId}`, {
                method: 'PUT',
                body: JSON.stringify({ n: newQuantity })
            });

            expect(response.status).toBe(200);
            expect(data.n).toBe(newQuantity);
        });

        it('should delete a stamp', async () => {
            // First add a stamp
            const { data: newStamp } = await apiRequest('/api/stamps/collection', {
                method: 'POST',
                body: JSON.stringify({ name: 'Delete Test Vitest', value: 2.00, currency: 'EUR', n: 1 })
            });

            const stampId = newStamp.id;

            const { response: deleteResponse } = await apiRequest(`/api/stamps/collection/${stampId}`, {
                method: 'DELETE',
                expectJson: false
            });

            expect(deleteResponse.status).toBe(204);

            // Verify it's deleted
            const { response: getResponse } = await apiRequest(`/api/stamps/collection/${stampId}`);
            expect(getResponse.status).toBe(404);
        });

        it('should validate stamp data', async () => {
            // Test invalid data
            const { response } = await apiRequest('/api/stamps/collection', {
                method: 'POST',
                body: JSON.stringify({ name: '', value: -100, currency: 'INVALID', n: -1 })
            });

            expect(response.status).toBe(400);
        });
    });

    describe('Postage Rates API', () => {
        it('should get all postage rates', async () => {
            const { response, data } = await apiRequest('/api/stamps/postage-rates');

            expect(response.status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
        });

        it('should add a new postage rate', async () => {
            const newRate = {
                name: 'Test Rate Vitest',
                value: 3.00,
                max_weight: 100
            };

            const { response, data } = await apiRequest('/api/stamps/postage-rates', {
                method: 'POST',
                body: JSON.stringify(newRate)
            });

            expect(response.status).toBe(201);
            expect(data.name).toBe(newRate.name);
            expect(data.value).toBe(newRate.value);
            expect(data.max_weight).toBe(newRate.max_weight);
        });

        it('should update a postage rate', async () => {
            const rateName = 'Update Rate Test Vitest';
            
            // First add a rate
            await apiRequest('/api/stamps/postage-rates', {
                method: 'POST',
                body: JSON.stringify({ name: rateName, value: 4.00, max_weight: 50 })
            });

            // Then update it
            const newRateValue = 5.00;
            const newMaxWeight = 75;
            const { response, data } = await apiRequest(`/api/stamps/postage-rates/${encodeURIComponent(rateName)}`, {
                method: 'PUT',
                body: JSON.stringify({ value: newRateValue, max_weight: newMaxWeight })
            });

            expect(response.status).toBe(200);
            expect(data.value).toBe(newRateValue);
            expect(data.max_weight).toBe(newMaxWeight);
        });

        it('should delete a postage rate', async () => {
            const rateName = 'Delete Rate Test Vitest';
            
            // First add a rate
            await apiRequest('/api/stamps/postage-rates', {
                method: 'POST',
                body: JSON.stringify({ name: rateName, value: 6.00, max_weight: 200 })
            });

            // Then delete it
            const { response: deleteResponse } = await apiRequest(`/api/stamps/postage-rates/${encodeURIComponent(rateName)}`, {
                method: 'DELETE',
                expectJson: false
            });

            expect(deleteResponse.status).toBe(204);

            // Verify it's deleted
            const { response: getResponse } = await apiRequest(`/api/stamps/postage-rates/${encodeURIComponent(rateName)}`);
            expect(getResponse.status).toBe(404);
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for non-existent endpoints', async () => {
            const { response } = await apiRequest('/api/non-existent');
            expect(response.status).toBe(404);
        });

        it('should return 404 for non-existent stamp', async () => {
            const { response } = await apiRequest('/api/stamps/collection/99999');
            expect(response.status).toBe(404);
        });
    });
});
