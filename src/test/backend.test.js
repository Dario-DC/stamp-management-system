/**
 * Backend Integration Tests for Stamp Management System
 * Tests the Node.js Express API endpoints via HTTP requests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE_URL = 'http://localhost:3001';

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
        // Wait for server to be ready
        let attempts = 0;
        while (attempts < 10) {
            try {
                const { response } = await apiRequest('/health');
                if (response.ok) break;
            } catch (error) {
                // Server not ready yet
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
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
                val: 100,
                n: 5
            };

            const { response, data } = await apiRequest('/api/stamps/collection', {
                method: 'POST',
                body: JSON.stringify(newStamp)
            });

            expect(response.status).toBe(201);
            expect(data).toHaveProperty('id');
            expect(data.name).toBe(newStamp.name);
            expect(data.val).toBe(newStamp.val);
            expect(data.n).toBe(newStamp.n);
        });

        it('should update stamp quantity', async () => {
            // First add a stamp
            const { data: newStamp } = await apiRequest('/api/stamps/collection', {
                method: 'POST',
                body: JSON.stringify({ name: 'Update Test Vitest', val: 150, n: 10 })
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
                body: JSON.stringify({ name: 'Delete Test Vitest', val: 200, n: 1 })
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
                body: JSON.stringify({ name: '', val: -100, n: -1 })
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
                rate: 300
            };

            const { response, data } = await apiRequest('/api/stamps/postage-rates', {
                method: 'POST',
                body: JSON.stringify(newRate)
            });

            expect(response.status).toBe(201);
            expect(data.name).toBe(newRate.name);
            expect(data.rate).toBe(newRate.rate);
        });

        it('should update a postage rate', async () => {
            const rateName = 'Update Rate Test Vitest';
            
            // First add a rate
            await apiRequest('/api/stamps/postage-rates', {
                method: 'POST',
                body: JSON.stringify({ name: rateName, rate: 400 })
            });

            // Then update it
            const newRateValue = 500;
            const { response, data } = await apiRequest(`/api/stamps/postage-rates/${encodeURIComponent(rateName)}`, {
                method: 'PUT',
                body: JSON.stringify({ rate: newRateValue })
            });

            expect(response.status).toBe(200);
            expect(data.rate).toBe(newRateValue);
        });

        it('should delete a postage rate', async () => {
            const rateName = 'Delete Rate Test Vitest';
            
            // First add a rate
            await apiRequest('/api/stamps/postage-rates', {
                method: 'POST',
                body: JSON.stringify({ name: rateName, rate: 600 })
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
