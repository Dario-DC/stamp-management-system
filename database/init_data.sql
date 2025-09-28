-- Initial data for the stamp management system
-- This will be loaded when the application starts for the first time

-- Initialize postage rates (these should be available from the start)
-- Values are in euros (converted from cents), max_weight in grams
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

-- Note: stamps table starts empty - users will add their own stamps
