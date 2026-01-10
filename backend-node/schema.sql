CREATE DATABASE IF NOT EXISTS sortsense_db;
USE sortsense_db;

-- 1. Waste Categories Table
DROP TABLE IF EXISTS collection_centers;
DROP TABLE IF EXISTS waste_categories;

CREATE TABLE waste_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),
    disposal_method TEXT,
    rules TEXT,
    description TEXT
);

-- 2. Collection Centers Table
CREATE TABLE collection_centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- Linking by name for simplicity with current architecture
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    FOREIGN KEY (category) REFERENCES waste_categories(name) ON DELETE SET NULL
);

-- 3. SEED DATA (Synced with mock_db.js + Extended with KERALA_WASTE_DATA)

INSERT INTO waste_categories (name, color, disposal_method, rules, description) VALUES 
('plastic', '#EF4444', 
 'Clean & give to Haritha Karma Sena.', 
 'Wash to remove food residue. Do not burn. Store in dry place.',
 'Synthetic polymers that do not decompose easily (e.g., Plastic bottles, covers, bags).'),

('organic', '#10B981', 
 'Compost at source or use community bio-bins.', 
 'Use green bins. Do not mix with plastic. Cover to prevent flies.',
 'Waste that comes from plants or animals and decomposes naturally.'),

('ewaste', '#8B5CF6', 
 'Handover to authorized collection centers.', 
 'Do not dismantle. Keep dry. Store separately from other waste.',
 'Discarded electronic devices (e.g., Phones, chargers, laptops, TVs).'),

('metal', '#64748B', 
 'Sell to scrap dealers or Haritha Karma Sena.', 
 'Clean food cans. Watch out for sharp edges.',
 'Metallic materials usually recyclable (e.g., Cans, tins, utensils).'),

('glass', '#3B82F6', 
 'Rinse and hand over to scrap dealers.', 
 'Wrap broken glass in newspaper. Keep bottles intact if possible.',
 'Silica-based materials, non-biodegradable but recyclable.'),

('hazardous', '#DC2626', 
 'Hand over to hazardous waste treatment facilities.', 
 'Do not drain into sink. Keep in original container. Label clearly.',
 'Toxic, flammable, or corrosive waste (e.g., Chemicals, pesticides, paint).'),

('biomedical', '#991B1B', 
 'Use yellow bags. Handover to IMAGE or authorized agency.', 
 'Do not mix with general waste. High infection risk.',
 'Medical/hearing waste (e.g., Syringes, gloves, bandages).'),

('paper', '#F59E0B', 
 'Recycle via scrap dealers.', 
 'Keep dry. Remove plastic covers or bindings.',
 'Processed wood pulp, mostly recyclable (e.g., Newspapers, notebooks).'),

('battery', '#7C3AED', 
 'Tape terminals. Drop off at e-waste/battery centers.', 
 'Hazardous. Do not puncture or burn. Keep away from kids.',
 'Hazardous metal waste with toxic chemicals.'),

('mixed', '#374151', 
 'Handover to HKS as rejects if accepted, or sanitary landfill.', 
 'Try to segregate better next time. Do not burn.',
 'Non-recyclable/Non-compostable (e.g., Soiled plastics).'),

('sanitary', '#BE123C', 
 'Securely wrap in newspaper (mark Red Cross). Handover separately.', 
 'Biological hazard. Keep wrapped.',
 'Personal hygiene waste (e.g., Pads, diapers, tissues).'),

('construction', '#78350F', 
 'Use designated C&D waste skips or collection service.', 
 'Heavy dust! Wear mask. Watch for nails.',
 'Building debris (e.g., Bricks, cement, tiles).'),

('agricultural', '#65A30D', 
 'Compost at source or use as biomass fuel.', 
 'Dry waste is flammable. Keep away from fire.',
 'Farming waste (e.g., Crop residue, dry leaves).');

-- 4. SEED CENTERS (Kerala Locations)
INSERT INTO collection_centers (name, category, latitude, longitude, address, phone) VALUES
('Municipal Plastic Collection Unit', 'plastic', 9.9312, 76.2673, 'Market Road, Kochi', '0484-223344'),
('City Organic Compost Plant', 'organic', 9.9400, 76.2700, 'Green Zone, Park Avenue', '0484-998877'),
('E-Waste Recycling Hub', 'ewaste', 9.9500, 76.2800, 'IT Park Campus', '1800-425-999'),
('Metal Scrap Yard', 'metal', 9.9600, 76.2900, 'Industrial Estate', '0484-776655'),
('Glass Recycling Facility', 'glass', 9.9350, 76.2650, 'Harbor View Road', '0484-112233'),
('Hazardous Waste Treatment Plant', 'hazardous', 10.0000, 76.3500, 'Outer Ring Road', '0491-255566'),
('Paper Recycling Depot', 'paper', 9.9450, 76.2750, 'Press Road', '9845012345'),
-- Testing Trivandrum Locations
('Trivandrum Plastic Facility', 'plastic', 8.5241, 76.9366, 'Trivandrum City', '0471-233445'),
('Local Glass Dealer', 'glass', 8.5300, 76.9400, 'Chala Market', '9999888877');
