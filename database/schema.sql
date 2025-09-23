-- Stamp Management System Database Schema

-- Table 1: Stamp Collection
-- Stores information about stamps in the collection with their values and quantities
CREATE TABLE IF NOT EXISTS stamp_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    val INTEGER NOT NULL, -- stamp value in cents of euros
    n INTEGER NOT NULL DEFAULT 0, -- number of stamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Postage Rates
-- Stores current postage rates for stamps (can be updated)
CREATE TABLE IF NOT EXISTS postage_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    rate INTEGER NOT NULL, -- postage rate in cents of euros
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stamp_collection_name ON stamp_collection(name);
CREATE INDEX IF NOT EXISTS idx_postage_rates_name ON postage_rates(name);

-- Trigger to update the updated_at timestamp for stamp_collection
CREATE TRIGGER IF NOT EXISTS update_stamp_collection_timestamp 
    AFTER UPDATE ON stamp_collection
BEGIN
    UPDATE stamp_collection SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update the updated_at timestamp for postage_rates
CREATE TRIGGER IF NOT EXISTS update_postage_rates_timestamp 
    AFTER UPDATE ON postage_rates
BEGIN
    UPDATE postage_rates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
