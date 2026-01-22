
CREATE TABLE IF NOT EXISTS tbl_pickup_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    waste_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES tbl_pickup_requests(request_id) ON DELETE CASCADE
);
