/**
 * API Routes for Stamp Management System
 * Defines all REST endpoints for stamps and postage rates
 */

import express from 'express';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Validation rules
const stampValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('value').isNumeric().withMessage('Value must be a positive number'),
    body('currency').isIn(['ITL', 'EUR']).withMessage('Currency must be ITL or EUR'),
    body('n').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('postage_rate_id').optional().isInt({ min: 1 }).withMessage('Postage rate ID must be a positive integer')
];

const rateValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('value').isNumeric().withMessage('Value must be a positive number'),
    body('max_weight').isInt({ min: 1 }).withMessage('Max weight must be a positive integer (grams)')
];

const idValidation = [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
];

// Routes factory function
export default function createRoutes(db) {
    
    // ===== STAMP COLLECTION ROUTES =====
    
    // GET /api/stamps/collection - Get all stamps
    router.get('/stamps/collection', (req, res) => {
        try {
            const stamps = db.getStampCollection();
            res.json(stamps);
        } catch (error) {
            console.error('Error fetching stamp collection:', error);
            res.status(500).json({ error: 'Failed to fetch stamp collection' });
        }
    });

    // GET /api/stamps/collection/:id - Get specific stamp
    router.get('/stamps/collection/:id', idValidation, handleValidationErrors, (req, res) => {
        try {
            const stamp = db.getStampById(req.params.id);
            if (!stamp) {
                return res.status(404).json({ error: 'Stamp not found' });
            }
            res.json(stamp);
        } catch (error) {
            console.error('Error fetching stamp:', error);
            res.status(500).json({ error: 'Failed to fetch stamp' });
        }
    });

    // POST /api/stamps/collection - Add new stamp
    router.post('/stamps/collection', stampValidation, handleValidationErrors, (req, res) => {
        try {
            const { name, value, currency, n = 1, postage_rate_id = null } = req.body;
            const newStamp = db.addStampToCollection(name, value, currency, n, postage_rate_id);
            
            // Fetch the complete stamp record
            const fullStamp = db.getStampById(newStamp.id);
            res.status(201).json(fullStamp);
        } catch (error) {
            console.error('Error adding stamp:', error);
            res.status(500).json({ error: 'Failed to add stamp' });
        }
    });

    // PUT /api/stamps/collection/:id - Update stamp quantity
    router.put('/stamps/collection/:id', 
        [...idValidation, body('n').isInt({ min: 0 })], 
        handleValidationErrors, 
        (req, res) => {
            try {
                const { n } = req.body;
                const updated = db.updateStampQuantity(req.params.id, n);
                
                if (!updated) {
                    return res.status(404).json({ error: 'Stamp not found' });
                }
                
                const updatedStamp = db.getStampById(req.params.id);
                res.json(updatedStamp);
            } catch (error) {
                console.error('Error updating stamp quantity:', error);
                res.status(500).json({ error: 'Failed to update stamp quantity' });
            }
        }
    );

    // PATCH /api/stamps/collection/:id - Update entire stamp
    router.patch('/stamps/collection/:id', 
        [...idValidation, ...stampValidation], 
        handleValidationErrors, 
        (req, res) => {
            try {
                const { name, value, currency, n, postage_rate_id = null } = req.body;
                const updated = db.updateStamp(req.params.id, name, value, currency, n, postage_rate_id);
                
                if (!updated) {
                    return res.status(404).json({ error: 'Stamp not found' });
                }
                
                const updatedStamp = db.getStampById(req.params.id);
                res.json(updatedStamp);
            } catch (error) {
                console.error('Error updating stamp:', error);
                res.status(500).json({ error: 'Failed to update stamp' });
            }
        }
    );

    // DELETE /api/stamps/collection/:id - Delete stamp
    router.delete('/stamps/collection/:id', idValidation, handleValidationErrors, (req, res) => {
        try {
            const deleted = db.deleteStampFromCollection(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Stamp not found' });
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting stamp:', error);
            res.status(500).json({ error: 'Failed to delete stamp' });
        }
    });

    // GET /api/stamps/collection/currency/:currency - Get stamps by currency
    router.get('/stamps/collection/currency/:currency', (req, res) => {
        try {
            const currency = req.params.currency.toUpperCase();
            if (!['EUR', 'ITL'].includes(currency)) {
                return res.status(400).json({ error: 'Invalid currency. Must be EUR or ITL' });
            }
            const stamps = db.getStampsByCurrency(currency);
            res.json(stamps);
        } catch (error) {
            console.error('Error fetching stamps by currency:', error);
            res.status(500).json({ error: 'Failed to fetch stamps by currency' });
        }
    });

    // GET /api/stamps/collection/postage-rate/:id - Get stamps by postage rate
    router.get('/stamps/collection/postage-rate/:id', idValidation, handleValidationErrors, (req, res) => {
        try {
            const stamps = db.getStampsByPostageRate(req.params.id);
            res.json(stamps);
        } catch (error) {
            console.error('Error fetching stamps by postage rate:', error);
            res.status(500).json({ error: 'Failed to fetch stamps by postage rate' });
        }
    });

    // GET /api/stamps/collection/stats - Get collection statistics
    router.get('/stamps/collection/stats', (req, res) => {
        try {
            const stats = db.getCollectionStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching collection statistics:', error);
            res.status(500).json({ error: 'Failed to fetch collection statistics' });
        }
    });

    // ===== POSTAGE RATES ROUTES =====

    // GET /api/stamps/postage-rates - Get all postage rates
    router.get('/stamps/postage-rates', (req, res) => {
        try {
            const rates = db.getPostageRates();
            res.json(rates);
        } catch (error) {
            console.error('Error fetching postage rates:', error);
            res.status(500).json({ error: 'Failed to fetch postage rates' });
        }
    });

    // GET /api/stamps/postage-rates/:name - Get specific rate by name
    router.get('/stamps/postage-rates/:name', (req, res) => {
        try {
            const rateName = decodeURIComponent(req.params.name);
            const rate = db.getRateByName(rateName);
            if (!rate) {
                return res.status(404).json({ error: 'Postage rate not found' });
            }
            res.json(rate);
        } catch (error) {
            console.error('Error fetching postage rate:', error);
            res.status(500).json({ error: 'Failed to fetch postage rate' });
        }
    });

    // GET /api/stamps/postage-rates/id/:id - Get specific rate by ID
    router.get('/stamps/postage-rates/id/:id', idValidation, handleValidationErrors, (req, res) => {
        try {
            const rate = db.getRateById(req.params.id);
            if (!rate) {
                return res.status(404).json({ error: 'Postage rate not found' });
            }
            res.json(rate);
        } catch (error) {
            console.error('Error fetching postage rate:', error);
            res.status(500).json({ error: 'Failed to fetch postage rate' });
        }
    });

    // POST /api/stamps/postage-rates - Add or update postage rate
    router.post('/stamps/postage-rates', rateValidation, handleValidationErrors, (req, res) => {
        try {
            const { name, value, max_weight } = req.body;
            const result = db.addPostageRate(name, value, max_weight);
            
            if (!result) {
                return res.status(500).json({ error: 'Failed to add postage rate' });
            }
            
            res.status(201).json(result);
        } catch (error) {
            console.error('Error adding postage rate:', error);
            res.status(500).json({ error: 'Failed to add postage rate' });
        }
    });

    // PUT /api/stamps/postage-rates/:name - Update postage rate
    router.put('/stamps/postage-rates/:name', 
        [body('value').isNumeric(), body('max_weight').isInt({ min: 1 })], 
        handleValidationErrors, 
        (req, res) => {
            try {
                const rateName = decodeURIComponent(req.params.name);
                const { value, max_weight } = req.body;
                const updated = db.updateRateByName(rateName, value, max_weight);
                
                if (!updated) {
                    return res.status(404).json({ error: 'Postage rate not found' });
                }
                
                const updatedRate = db.getRateByName(rateName);
                res.json(updatedRate);
            } catch (error) {
                console.error('Error updating postage rate:', error);
                res.status(500).json({ error: 'Failed to update postage rate' });
            }
        }
    );

    // PUT /api/stamps/postage-rates/id/:id - Update postage rate by ID
    router.put('/stamps/postage-rates/id/:id', 
        [...idValidation, body('name').isString().isLength({ min: 1, max: 255 }).trim(), body('value').isNumeric(), body('max_weight').isInt({ min: 1 })], 
        handleValidationErrors, 
        (req, res) => {
            try {
                const { name, value, max_weight } = req.body;
                const updated = db.updateRateById(req.params.id, name, value, max_weight);
                
                if (!updated) {
                    return res.status(404).json({ error: 'Postage rate not found' });
                }
                
                const updatedRate = db.getRateById(req.params.id);
                res.json(updatedRate);
            } catch (error) {
                console.error('Error updating postage rate:', error);
                res.status(500).json({ error: 'Failed to update postage rate' });
            }
        }
    );

    // DELETE /api/stamps/postage-rates/:name - Delete postage rate
    router.delete('/stamps/postage-rates/:name', (req, res) => {
        try {
            const rateName = decodeURIComponent(req.params.name);
            const deleted = db.deleteRateByName(rateName);
            if (!deleted) {
                return res.status(404).json({ error: 'Postage rate not found' });
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting postage rate:', error);
            res.status(500).json({ error: 'Failed to delete postage rate' });
        }
    });

    // DELETE /api/stamps/postage-rates/id/:id - Delete postage rate by ID
    router.delete('/stamps/postage-rates/id/:id', idValidation, handleValidationErrors, (req, res) => {
        try {
            const deleted = db.deleteRateById(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Postage rate not found' });
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting postage rate:', error);
            res.status(500).json({ error: 'Failed to delete postage rate' });
        }
    });

    return router;
}
