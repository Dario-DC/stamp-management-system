-- Sample data for testing the stamp management system

-- Insert sample postage rates first (so we can reference them in stamps)
INSERT OR IGNORE INTO postage_rates (name, value, max_weight) VALUES
    ('A', 3.00, 100),
    ('B', 1.30, 20),
    ('A Zona 1', 3.75, 50),
    ('B Zona 1', 1.35, 20),
    ('A Zona 2', 4.85, 50),
    ('B Zona 2', 2.55, 20),
    ('A Zona 3', 5.95, 50),
    ('B Zona 3', 3.35, 20),
    ('B 50g', 2.90, 50),
    ('B Zona 1 50g', 3.30, 50),
    ('B Zona 2 50g', 4.15, 50),
    ('B Zona 3 50g', 5.15, 50);

-- Insert sample stamps - some linked to postage rates, some standalone
INSERT OR IGNORE INTO stamps (name, value, currency, n, postage_rate_id) VALUES
    -- Stamps that match postage rates (will be synced by triggers)
    ('A', 3.00, 'EUR', 50, 1),
    ('B', 1.30, 'EUR', 25, 2),
    ('A Zona 1', 3.75, 'EUR', 15, 3),
    ('B Zona 1', 1.35, 'EUR', 10, 4),
    
    -- Standalone stamps (no postage rate reference)
    ('€1.50', 1.50, 'EUR', 30, NULL),
    ('₤180', 180, 'ITL', 40, NULL),
    ('€2.20', 2.20, 'EUR', 20, NULL),
    ('₤500', 500, 'ITL', 15, NULL);
