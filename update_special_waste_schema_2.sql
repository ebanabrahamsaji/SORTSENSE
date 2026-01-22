
ALTER TABLE tbl_special_waste_requests ADD COLUMN center_id INT;
ALTER TABLE tbl_special_waste_requests ADD FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id);
