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

-- Table 2: Stamp Tariffs
-- Stores current postage tariffs for stamps (can be updated)
CREATE TABLE IF NOT EXISTS stamp_tariffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    tariff INTEGER NOT NULL, -- postage tariff in cents of euros
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stamp_collection_name ON stamp_collection(name);
CREATE INDEX IF NOT EXISTS idx_stamp_tariffs_name ON stamp_tariffs(name);

-- Trigger to update the updated_at timestamp for stamp_collection
CREATE TRIGGER IF NOT EXISTS update_stamp_collection_timestamp 
    AFTER UPDATE ON stamp_collection
BEGIN
    UPDATE stamp_collection SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update the updated_at timestamp for stamp_tariffs
CREATE TRIGGER IF NOT EXISTS update_stamp_tariffs_timestamp 
    AFTER UPDATE ON stamp_tariffs
BEGIN
    UPDATE stamp_tariffs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
