/**
 * Express.js Server for Stamp Management System
 * RESTful API backend with SQLite database
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import StampDatabase from './database.js';
import createRoutes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new StampDatabase();

// Middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding for development
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['http://localhost:4173', 'http://localhost:5173'] // Vite preview and dev ports
        : true, // Allow all origins in development
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api', limiter);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.use('/api', createRoutes(db));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.originalUrl 
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    db.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    db.close();
    process.exit(0);
});

// Function to start server
function startServer() {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Stamp Management API Server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🏷️  API base URL: http://localhost:${PORT}/api`);
        
        // Load sample data on first run (development only)
        if (process.env.NODE_ENV !== 'production') {
            try {
                // Check if database is empty
                const stamps = db.getStampCollection();
                const rates = db.getPostageRates();
                
                if (stamps.length === 0 && rates.length === 0) {
                    console.log('🌱 Loading sample data...');
                    db.loadSampleData();
                    console.log('✅ Sample data loaded successfully');
                }
            } catch (error) {
                console.error('⚠️  Error loading sample data:', error.message);
            }
        }
    });
    
    return server;
}

// Start server only if this file is run directly (not imported)
let server;
if (import.meta.url === `file://${process.argv[1]}`) {
    server = startServer();
}

export { app, db, startServer };
export default server;
