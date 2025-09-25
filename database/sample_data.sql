-- Sample data for testing the stamp management system

-- Insert sample postage rates first (so we can reference them in stamps)
INSERT OR IGNORE INTO postage_rates (name, value, max_weight) VALUES
    ('A', 0.95, 20),
    ('B', 1.30, 100),
    ('A1', 3.75, 20),
    ('B1', 1.35, 100),
    ('A2', 4.85, 20),
    ('B2', 2.55, 100),
    ('A3', 5.95, 20),
    ('B3', 3.35, 100),
    ('B_50', 2.90, 50),
    ('B1_50', 3.30, 50),
    ('B2_50', 4.15, 50),
    ('B3_50', 5.15, 50);

-- Insert sample stamps - some linked to postage rates, some standalone
INSERT OR IGNORE INTO stamps (name, value, currency, n, postage_rate_id) VALUES
    -- Stamps that match postage rates (will be synced by triggers)
    ('A', 0.95, 'EUR', 50, 1),
    ('B', 1.30, 'EUR', 25, 2),
    ('A1', 3.75, 'EUR', 15, 3),
    ('B1', 1.35, 'EUR', 10, 4),
    
    -- Standalone stamps (no postage rate reference)
    ('Commemorative Europe Stamp', 1.50, 'EUR', 30, NULL),
    ('Vintage Classic Stamp', 180, 'ITL', 40, NULL),
    ('Special Olympics Stamp', 2.20, 'EUR', 20, NULL),
    ('Heritage Building Stamp', 500, 'ITL', 15, NULL);
