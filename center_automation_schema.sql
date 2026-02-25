-- Add dynamic status and metrics to centers
ALTER TABLE tbl_collection_centers 
ADD COLUMN is_logged_in BOOLEAN DEFAULT FALSE,
ADD COLUMN last_active_at TIMESTAMP NULL,
ADD COLUMN current_operational_status ENUM('OPEN', 'IDLE', 'CLOSED') DEFAULT 'CLOSED',
ADD COLUMN avg_response_time_minutes FLOAT DEFAULT 0,
ADD COLUMN total_requests_handled INT DEFAULT 0;

-- Create Center Messages Table for Admin communication
CREATE TABLE IF NOT EXISTS tbl_center_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL, -- Admin User ID
    center_id INT NOT NULL, -- Target Center ID
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES tbl_users(user_id),
    FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id)
);

-- Index for performance tracking
CREATE INDEX idx_center_status ON tbl_collection_centers(current_operational_status);
CREATE INDEX idx_center_active ON tbl_collection_centers(last_active_at);
