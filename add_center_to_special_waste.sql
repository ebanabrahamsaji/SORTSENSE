
-- Add center_id to tbl_special_waste_requests
ALTER TABLE tbl_special_waste_requests ADD COLUMN center_id INT NULL AFTER location;
ALTER TABLE tbl_special_waste_requests ADD FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id) ON DELETE SET NULL;

-- Create center notifications table if missing (based on controller usage)
CREATE TABLE IF NOT EXISTS tbl_center_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    center_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id) ON DELETE CASCADE
);
