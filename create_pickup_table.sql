
-- Pickup Requests Table
CREATE TABLE IF NOT EXISTS tbl_pickup_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    center_id INT NOT NULL,
    waste_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Approved', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id) ON DELETE CASCADE
);
