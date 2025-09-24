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
    body('val').isInt({ min: 1 }).withMessage('Value must be a positive integer (cents)'),
    body('n').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

const rateValidation = [
    body('name').isString().isLength({ min: 1, max: 255 }).trim(),
    body('rate').isInt({ min: 1 }).withMessage('Rate must be a positive integer (cents)')
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
            const { name, val, n = 1 } = req.body;
            const newStamp = db.addStampToCollection(name, val, n);
            
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
                const { name, val, n } = req.body;
                const updated = db.updateStamp(req.params.id, name, val, n);
                
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

    // POST /api/stamps/postage-rates - Add or update postage rate
    router.post('/stamps/postage-rates', rateValidation, handleValidationErrors, (req, res) => {
        try {
            const { name, rate } = req.body;
            const result = db.addPostageRate(name, rate);
            
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
        [body('rate').isInt({ min: 1 })], 
        handleValidationErrors, 
        (req, res) => {
            try {
                const rateName = decodeURIComponent(req.params.name);
                const { rate } = req.body;
                const updated = db.updateRateByName(rateName, rate);
                
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

    return router;
}
