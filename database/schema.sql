-- Stamp Management System Database Schema

-- Currency conversion constant: 1 EUR = 1936.27 ITL
-- This constant is used in triggers for automatic currency conversion

-- Table 1: Postage Rates
-- Stores current postage rates for stamps with weight limits
CREATE TABLE IF NOT EXISTS postage_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    value DECIMAL(10,2) NOT NULL, -- postage rate value in euros
    max_weight INTEGER NOT NULL, -- maximum weight in grams
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Stamps
-- Stores information about stamps in the collection with their values and quantities
CREATE TABLE IF NOT EXISTS stamps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL, -- original stamp value (ITL or EUR)
    currency TEXT NOT NULL CHECK (currency IN ('ITL', 'EUR')), -- currency type
    euro_cents INTEGER NOT NULL DEFAULT 0, -- current value in euro cents
    n INTEGER NOT NULL DEFAULT 0, -- number of stamps
    postage_rate_id INTEGER, -- reference to postage_rates
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postage_rate_id) REFERENCES postage_rates(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stamps_name ON stamps(name);
CREATE INDEX IF NOT EXISTS idx_stamps_currency ON stamps(currency);
CREATE INDEX IF NOT EXISTS idx_stamps_postage_rate_id ON stamps(postage_rate_id);
CREATE INDEX IF NOT EXISTS idx_postage_rates_name ON postage_rates(name);
CREATE INDEX IF NOT EXISTS idx_postage_rates_max_weight ON postage_rates(max_weight);

-- Trigger to update the updated_at timestamp for stamps
CREATE TRIGGER IF NOT EXISTS update_stamps_timestamp 
    AFTER UPDATE ON stamps
BEGIN
    UPDATE stamps SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update the updated_at timestamp for postage_rates
CREATE TRIGGER IF NOT EXISTS update_postage_rates_timestamp 
    AFTER UPDATE ON postage_rates
BEGIN
    UPDATE postage_rates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to sync stamp name and value with postage_rates when postage_rate_id is set
CREATE TRIGGER IF NOT EXISTS sync_stamp_with_postage_rate_on_insert
    AFTER INSERT ON stamps
    WHEN NEW.postage_rate_id IS NOT NULL
BEGIN
    UPDATE stamps 
    SET name = (SELECT name FROM postage_rates WHERE id = NEW.postage_rate_id),
        value = (SELECT value FROM postage_rates WHERE id = NEW.postage_rate_id)
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS sync_stamp_with_postage_rate_on_update
    AFTER UPDATE ON stamps
    WHEN NEW.postage_rate_id IS NOT NULL AND (OLD.postage_rate_id IS NULL OR OLD.postage_rate_id != NEW.postage_rate_id)
BEGIN
    UPDATE stamps 
    SET name = (SELECT name FROM postage_rates WHERE id = NEW.postage_rate_id),
        value = (SELECT value FROM postage_rates WHERE id = NEW.postage_rate_id)
    WHERE id = NEW.id;
END;

-- Trigger to update stamps when postage_rates are updated
CREATE TRIGGER IF NOT EXISTS update_stamps_when_postage_rate_changes
    AFTER UPDATE ON postage_rates
BEGIN
    UPDATE stamps 
    SET name = NEW.name,
        value = NEW.value,
        updated_at = CURRENT_TIMESTAMP
    WHERE postage_rate_id = NEW.id;
END;

-- Trigger to automatically calculate euro_cents based on currency and value
CREATE TRIGGER IF NOT EXISTS calculate_euro_cents_on_insert
    AFTER INSERT ON stamps
BEGIN
    UPDATE stamps 
    SET euro_cents = CASE 
        WHEN NEW.currency = 'EUR' THEN CAST(NEW.value * 100 AS INTEGER)
        WHEN NEW.currency = 'ITL' THEN ROUND(NEW.value / 1936.27 * 100)
        ELSE 0
    END
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS calculate_euro_cents_on_update
    AFTER UPDATE ON stamps
    WHEN NEW.currency != OLD.currency OR NEW.value != OLD.value
BEGIN
    UPDATE stamps 
    SET euro_cents = CASE 
        WHEN NEW.currency = 'EUR' THEN CAST(NEW.value * 100 AS INTEGER)
        WHEN NEW.currency = 'ITL' THEN ROUND(NEW.value / 1936.27 * 100)
        ELSE NEW.euro_cents
    END
    WHERE id = NEW.id;
END;
