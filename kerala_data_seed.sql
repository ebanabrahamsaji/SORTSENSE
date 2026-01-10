-- Insert Categories
INSERT IGNORE INTO tbl_categories (category_name, description) VALUES
('Plastic', 'All types of rigid and flexible plastics, bottles, and wrappers.'),
('Glass', 'Bottles, jars, and broken glass.'),
('Metal', 'Cans, foils, and metal scraps.'),
('Organic', 'Food waste, vegetable peels, and biodegradable matter.'),
('E-waste', 'Electronic gadgets, wires, batteries, and appliances.'),
('Paper', 'Newspapers, cardboard, and office paper.'),
('Hazardous', 'Medical waste, chemicals, and sanitary waste.');

-- Insert Waste Items (Typical Examples linked to Categories)
-- Note: We use these for the 'detail lookup' if the specific item isn't strictly matched
INSERT IGNORE INTO tbl_waste_items (item_name, category_id, disposal_guideline, safety_instructions) VALUES
('Plastic Bottle', 
 (SELECT category_id FROM tbl_categories WHERE category_name='Plastic'),
 'Wash, dry, and squash the bottle. Store in a dry bag and hand over to Haritha Karma Sena.',
 'Do not burn. Toxic fumes are released.'),

('Glass Jar',
 (SELECT category_id FROM tbl_categories WHERE category_name='Glass'),
 'Rinse thoroughly. Remove lids. Keep intact if possible.',
 'Handle broken glass with care. Wrap in newspaper before disposal.'),

('Organic Waste',
 (SELECT category_id FROM tbl_categories WHERE category_name='Organic'),
 'use for home composting (bio-bin/bucket compost).',
 'Do not mix with plastics.'),

('E-Waste Items',
 (SELECT category_id FROM tbl_categories WHERE category_name='E-waste'),
 'Store separately in dry condition. Hand over to special e-waste collection drives.',
 'Do not break or dismantle batteries as they may leak toxic chemicals.');


-- Insert Collection Centers (Kerala Examples)
INSERT IGNORE INTO tbl_collection_centers (center_name, latitude, longitude, address, contact_person, notes) VALUES
('Kochi Corporation Waste Plant', 9.939248, 76.270523, 'Brahmapuram, Kochi, Kerala', 'Health Officer', 'Accepts bulk organic and plastic waste.'),
('Trivandrum Smart Dump', 8.524139, 76.936638, 'Palayam, Thiruvananthapuram', 'Supervisor', 'Automated collection point.'),
('Edappally Collection Point', 10.023676, 76.308777, 'Near Lulu Mall, Edappally', 'Unit Head', 'Plastic and e-waste only.'),
('Kozhikode Recycling Unit', 11.258753, 75.780411, 'West Hill, Kozhikode', 'Manager', 'Paper and Metal recycling.');

-- Link Centers to Categories (All accept all for simplicity in demo, or specific)
INSERT IGNORE INTO tbl_accepted_categories (center_id, category_id)
SELECT c.center_id, cat.category_id 
FROM tbl_collection_centers c
CROSS JOIN tbl_categories cat;
