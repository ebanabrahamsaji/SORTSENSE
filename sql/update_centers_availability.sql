-- Add Availability Columns to Collection Centers
ALTER TABLE tbl_collection_centers
ADD COLUMN status VARCHAR(10) DEFAULT 'OPEN',
ADD COLUMN available_slots INT DEFAULT 10,
ADD COLUMN max_slots INT DEFAULT 10;
