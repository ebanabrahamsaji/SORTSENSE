
-- HOTFIX for PAPER Category
-- The user is getting "No center found" for Paper.
-- "Paper" should map to Scrap dealers and Recyclers.
-- We must ensure the 'Paper' category exists and is linked to 'scrap', 'recycler', 'hks', 'general'.

-- 1. Ensure Categories exist (Just in case)
INSERT IGNORE INTO tbl_categories (category_name, description) VALUES
('Paper', 'Newspapers, cardboard, and office paper.');

-- 2. Link 'Paper' to Collection Centers based on normalized types
INSERT IGNORE INTO tbl_accepted_categories (center_id, category_id)
SELECT c.center_id, cat.category_id 
FROM tbl_collection_centers c
JOIN tbl_categories cat ON cat.category_name = 'Paper'
WHERE c.type IN ('scrap', 'recycler', 'hks', 'general', 'mcf', 'municipality');

INSERT IGNORE INTO tbl_accepted_categories (center_id, category_id)
SELECT c.center_id, cat.category_id 
FROM tbl_collection_centers c
JOIN tbl_categories cat ON cat.category_name = 'Paper'
WHERE c.type IN ('Scrap', 'Recycler', 'HKS', 'General', 'MCF', 'Municipality');

-- Also verify Plastic just in case
INSERT IGNORE INTO tbl_accepted_categories (center_id, category_id)
SELECT c.center_id, cat.category_id 
FROM tbl_collection_centers c
JOIN tbl_categories cat ON cat.category_name = 'Plastic'
WHERE c.type IN ('hks', 'mcf', 'scrap', 'recycler', 'plastic');
