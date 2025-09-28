-- Update postage rate names to use proper Italian postal service names
-- Based on the provided mapping object

UPDATE postage_rates SET name = 'A' WHERE name = 'A';
UPDATE postage_rates SET name = 'B' WHERE name = 'B';
UPDATE postage_rates SET name = 'A Zona 1' WHERE name = 'A1';
UPDATE postage_rates SET name = 'B Zona 1' WHERE name = 'B1';
UPDATE postage_rates SET name = 'A Zona 2' WHERE name = 'A2';
UPDATE postage_rates SET name = 'B Zona 2' WHERE name = 'B2';
UPDATE postage_rates SET name = 'A Zona 3' WHERE name = 'A3';
UPDATE postage_rates SET name = 'B Zona 3' WHERE name = 'B3';
UPDATE postage_rates SET name = 'B 50g' WHERE name = 'B_50';
UPDATE postage_rates SET name = 'B Zona 1 50g' WHERE name = 'B1_50';
UPDATE postage_rates SET name = 'B Zona 2 50g' WHERE name = 'B2_50';
UPDATE postage_rates SET name = 'B Zona 3 50g' WHERE name = 'B3_50';

-- Also update any existing stamps that have the old names to use the new names
UPDATE stamps SET name = 'A' WHERE name = 'A';
UPDATE stamps SET name = 'B' WHERE name = 'B';
UPDATE stamps SET name = 'A Zona 1' WHERE name = 'A1';
UPDATE stamps SET name = 'B Zona 1' WHERE name = 'B1';
UPDATE stamps SET name = 'A Zona 2' WHERE name = 'A2';
UPDATE stamps SET name = 'B Zona 2' WHERE name = 'B2';
UPDATE stamps SET name = 'A Zona 3' WHERE name = 'A3';
UPDATE stamps SET name = 'B Zona 3' WHERE name = 'B3';
UPDATE stamps SET name = 'B 50g' WHERE name = 'B_50';
UPDATE stamps SET name = 'B Zona 1 50g' WHERE name = 'B1_50';
UPDATE stamps SET name = 'B Zona 2 50g' WHERE name = 'B2_50';
UPDATE stamps SET name = 'B Zona 3 50g' WHERE name = 'B3_50';
