
CREATE TABLE IF NOT EXISTS tbl_special_waste_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category ENUM('E-waste', 'Biomedical', 'Hazardous', 'Festival', 'Bulk', 'Medicines', 'Construction Debris') NOT NULL,
    quantity_value DECIMAL(10,2) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    description TEXT,
    preferred_date DATE NOT NULL,
    location TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Scheduled', 'Completed', 'Rejected') DEFAULT 'Pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
);
