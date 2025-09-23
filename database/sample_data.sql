-- Sample data for testing the stamp management system

-- Insert sample stamp collection data
INSERT INTO stamp_collection (name, val, n) VALUES
    ('Standard Letter Stamp', 120, 50),
    ('Priority Mail Stamp', 180, 25),
    ('International Stamp', 250, 15),
    ('Express Delivery Stamp', 350, 10),
    ('Commemorative Europe Stamp', 150, 30),
    ('Vintage Classic Stamp', 95, 40);

-- Insert sample postage rate data
INSERT INTO postage_rates (name, rate) VALUES
    ('Standard Letter', 120),
    ('Priority Mail', 180),
    ('International Letter', 250),
    ('Express Delivery', 350),
    ('Registered Mail', 200),
    ('Certified Mail', 280);
