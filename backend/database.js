/**
 * Database module for Stamp Management System
 * Uses better-sqlite3 for high-performance SQLite operations
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class StampDatabase {
    constructor(dbPath = './database/stamps.db') {
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.initDatabase();
        this.prepareStatements();
    }

    initDatabase() {
        // Read and execute schema
        const schemaPath = join(__dirname, '../database/schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');
        this.db.exec(schema);
        
        // Load sample data if database is empty
        const stampCount = this.db.prepare('SELECT COUNT(*) as count FROM stamps').get().count;
        if (stampCount === 0) {
            this.loadSampleData();
        }
    }

    loadSampleData() {
        const sampleDataPath = join(__dirname, '../database/sample_data.sql');
        const sampleData = readFileSync(sampleDataPath, 'utf8');
        this.db.exec(sampleData);
    }

    prepareStatements() {
        // Stamps Statements
        this.statements = {
            // Stamps
            getStampCollection: this.db.prepare(`
                SELECT s.*, pr.name as postage_rate_name
                FROM stamps s 
                LEFT JOIN postage_rates pr ON s.postage_rate_id = pr.id 
                ORDER BY s.name
            `),
            getStampById: this.db.prepare(`
                SELECT s.*, pr.name as postage_rate_name
                FROM stamps s 
                LEFT JOIN postage_rates pr ON s.postage_rate_id = pr.id 
                WHERE s.id = ?
            `),
            addStamp: this.db.prepare(`
                INSERT INTO stamps (name, value, currency, n, postage_rate_id) 
                VALUES (?, ?, ?, ?, ?)
            `),
            updateStampQuantity: this.db.prepare(`
                UPDATE stamps 
                SET n = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `),
            updateStamp: this.db.prepare(`
                UPDATE stamps 
                SET name = ?, value = ?, currency = ?, n = ?, postage_rate_id = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `),
            deleteStamp: this.db.prepare('DELETE FROM stamps WHERE id = ?'),

            // Postage Rates
            getPostageRates: this.db.prepare('SELECT * FROM postage_rates ORDER BY name'),
            getRateByName: this.db.prepare('SELECT * FROM postage_rates WHERE name = ?'),
            getRateById: this.db.prepare('SELECT * FROM postage_rates WHERE id = ?'),
            addRate: this.db.prepare(`
                INSERT INTO postage_rates (name, value, max_weight) 
                VALUES (?, ?, ?)
            `),
            updateRate: this.db.prepare(`
                UPDATE postage_rates 
                SET value = ?, max_weight = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE name = ?
            `),
            updateRateById: this.db.prepare(`
                UPDATE postage_rates 
                SET name = ?, value = ?, max_weight = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `),
            deleteRate: this.db.prepare('DELETE FROM postage_rates WHERE name = ?'),
            deleteRateById: this.db.prepare('DELETE FROM postage_rates WHERE id = ?')
        };
    }

    // Stamp Collection Methods
    getStampCollection() {
        return this.statements.getStampCollection.all();
    }

    getStampById(id) {
        return this.statements.getStampById.get(id);
    }

    addStampToCollection(name, value, currency, n = 1, postageRateId = null) {
        const result = this.statements.addStamp.run(name, value, currency, n, postageRateId);
        return { id: result.lastInsertRowid, name, value, currency, n, postage_rate_id: postageRateId };
    }

    updateStampQuantity(id, quantity) {
        const result = this.statements.updateStampQuantity.run(quantity, id);
        return result.changes > 0;
    }

    updateStamp(id, name, value, currency, n, postageRateId = null) {
        const result = this.statements.updateStamp.run(name, value, currency, n, postageRateId, id);
        return result.changes > 0;
    }

    deleteStampFromCollection(id) {
        const result = this.statements.deleteStamp.run(id);
        return result.changes > 0;
    }

    // Postage Rates Methods
    getPostageRates() {
        return this.statements.getPostageRates.all();
    }

    getRateByName(name) {
        return this.statements.getRateByName.get(name);
    }

    getRateById(id) {
        return this.statements.getRateById.get(id);
    }

    addPostageRate(name, value, maxWeight) {
        // Check if rate already exists
        const existing = this.getRateByName(name);
        if (existing) {
            // Update existing rate
            const result = this.statements.updateRate.run(value, maxWeight, name);
            return result.changes > 0 ? { ...existing, value, max_weight: maxWeight } : null;
        } else {
            // Add new rate
            const result = this.statements.addRate.run(name, value, maxWeight);
            return { id: result.lastInsertRowid, name, value, max_weight: maxWeight };
        }
    }

    updateRateByName(name, value, maxWeight) {
        const result = this.statements.updateRate.run(value, maxWeight, name);
        return result.changes > 0;
    }

    updateRateById(id, name, value, maxWeight) {
        const result = this.statements.updateRateById.run(name, value, maxWeight, id);
        return result.changes > 0;
    }

    deleteRateByName(name) {
        const result = this.statements.deleteRate.run(name);
        return result.changes > 0;
    }

    deleteRateById(id) {
        const result = this.statements.deleteRateById.run(id);
        return result.changes > 0;
    }

    // Utility Methods
    close() {
        this.db.close();
    }

    // Transaction wrapper
    transaction(fn) {
        return this.db.transaction(fn);
    }

    // Backup database
    backup(backupPath) {
        return this.db.backup(backupPath);
    }

    // Currency conversion utilities
    convertToEuroCents(value, currency) {
        if (currency === 'EUR') {
            return Math.round(value * 100);
        } else if (currency === 'ITL') {
            return Math.round((value / 1936.27) * 100);
        }
        throw new Error('Invalid currency. Must be EUR or ITL');
    }

    convertFromEuroCents(euroCents, currency) {
        if (currency === 'EUR') {
            return euroCents / 100;
        } else if (currency === 'ITL') {
            return (euroCents / 100) * 1936.27;
        }
        throw new Error('Invalid currency. Must be EUR or ITL');
    }

    // Get stamps by currency
    getStampsByCurrency(currency) {
        const stmt = this.db.prepare(`
            SELECT s.*, pr.name as postage_rate_name
            FROM stamps s 
            LEFT JOIN postage_rates pr ON s.postage_rate_id = pr.id 
            WHERE s.currency = ?
            ORDER BY s.name
        `);
        return stmt.all(currency);
    }

    // Get stamps by postage rate
    getStampsByPostageRate(postageRateId) {
        const stmt = this.db.prepare(`
            SELECT s.*, pr.name as postage_rate_name
            FROM stamps s 
            LEFT JOIN postage_rates pr ON s.postage_rate_id = pr.id 
            WHERE s.postage_rate_id = ?
            ORDER BY s.name
        `);
        return stmt.all(postageRateId);
    }

    // Get total collection value in euro cents
    getTotalCollectionValue() {
        const stmt = this.db.prepare(`
            SELECT SUM(euro_cents * n) as total_value_cents 
            FROM stamps
        `);
        const result = stmt.get();
        return result.total_value_cents || 0;
    }

    // Get collection statistics
    getCollectionStats() {
        const totalStamps = this.db.prepare('SELECT SUM(n) as total FROM stamps').get();
        const uniqueStamps = this.db.prepare('SELECT COUNT(*) as count FROM stamps').get();
        const totalValue = this.getTotalCollectionValue();
        const currencyBreakdown = this.db.prepare(`
            SELECT currency, COUNT(*) as count, SUM(n) as total_quantity, SUM(euro_cents * n) as total_value_cents
            FROM stamps 
            GROUP BY currency
        `).all();

        return {
            total_stamps: totalStamps.total || 0,
            unique_stamps: uniqueStamps.count || 0,
            total_value_cents: totalValue,
            total_value_euros: totalValue / 100,
            currency_breakdown: currencyBreakdown
        };
    }
}

export default StampDatabase;
