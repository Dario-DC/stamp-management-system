-- Test database initialization
-- This file creates a fresh test database with only postage rates
-- and ensures the stamps table is empty for testing

-- Clear all data first
DELETE FROM stamps;
DELETE FROM postage_rates;

-- Reset autoincrement counters
DELETE FROM sqlite_sequence WHERE name IN ('stamps', 'postage_rates');

-- Initialize postage rates (these should be available from the start)
-- Values are in euros, max_weight in grams
INSERT INTO postage_rates (name, value, max_weight) VALUES
    ('A', 3.00, 100),
    ('B', 1.30, 20),
    ('A1', 3.75, 50),
    ('B1', 1.35, 20),
    ('A2', 4.85, 50),
    ('B2', 2.55, 20),
    ('A3', 5.95, 50),
    ('B3', 3.35, 20),
    ('B_50', 2.90, 50),
    ('B1_50', 3.30, 50),
    ('B2_50', 4.15, 50),
    ('B3_50', 5.15, 50);

-- Stamps table should remain empty for testing
-- Users will add their own stamps during the test runs
