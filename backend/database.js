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
    }

    loadSampleData() {
        const sampleDataPath = join(__dirname, '../database/sample_data.sql');
        const sampleData = readFileSync(sampleDataPath, 'utf8');
        this.db.exec(sampleData);
    }

    prepareStatements() {
        // Stamp Collection Statements
        this.statements = {
            // Stamp Collection
            getStampCollection: this.db.prepare('SELECT * FROM stamp_collection ORDER BY name'),
            getStampById: this.db.prepare('SELECT * FROM stamp_collection WHERE id = ?'),
            addStamp: this.db.prepare(`
                INSERT INTO stamp_collection (name, val, n) 
                VALUES (?, ?, ?)
            `),
            updateStampQuantity: this.db.prepare(`
                UPDATE stamp_collection 
                SET n = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `),
            updateStamp: this.db.prepare(`
                UPDATE stamp_collection 
                SET name = ?, val = ?, n = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `),
            deleteStamp: this.db.prepare('DELETE FROM stamp_collection WHERE id = ?'),

            // Postage Rates
            getPostageRates: this.db.prepare('SELECT * FROM postage_rates ORDER BY name'),
            getRateByName: this.db.prepare('SELECT * FROM postage_rates WHERE name = ?'),
            getRateById: this.db.prepare('SELECT * FROM postage_rates WHERE id = ?'),
            addRate: this.db.prepare(`
                INSERT INTO postage_rates (name, rate) 
                VALUES (?, ?)
            `),
            updateRate: this.db.prepare(`
                UPDATE postage_rates 
                SET rate = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE name = ?
            `),
            updateRateById: this.db.prepare(`
                UPDATE postage_rates 
                SET name = ?, rate = ?, updated_at = CURRENT_TIMESTAMP 
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

    addStampToCollection(name, val, n = 1) {
        const result = this.statements.addStamp.run(name, val, n);
        return { id: result.lastInsertRowid, name, val, n };
    }

    updateStampQuantity(id, quantity) {
        const result = this.statements.updateStampQuantity.run(quantity, id);
        return result.changes > 0;
    }

    updateStamp(id, name, val, n) {
        const result = this.statements.updateStamp.run(name, val, n, id);
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

    addPostageRate(name, rate) {
        // Check if rate already exists
        const existing = this.getRateByName(name);
        if (existing) {
            // Update existing rate
            const result = this.statements.updateRate.run(rate, name);
            return result.changes > 0 ? { ...existing, rate } : null;
        } else {
            // Add new rate
            const result = this.statements.addRate.run(name, rate);
            return { id: result.lastInsertRowid, name, rate };
        }
    }

    updateRateByName(name, rate) {
        const result = this.statements.updateRate.run(rate, name);
        return result.changes > 0;
    }

    updateRateById(id, name, rate) {
        const result = this.statements.updateRateById.run(name, rate, id);
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
}

export default StampDatabase;
