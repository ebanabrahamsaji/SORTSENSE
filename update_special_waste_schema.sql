
ALTER TABLE tbl_special_waste_requests ADD COLUMN image_url VARCHAR(255);
-- Check if tbl_notifications exists (Implicitly assuming it does based on previous context, but will create if not just in case of new env)
CREATE TABLE IF NOT EXISTS tbl_notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
);
