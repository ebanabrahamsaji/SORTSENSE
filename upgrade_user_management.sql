
-- 1. Upgrade tbl_users with moderation fields
ALTER TABLE tbl_users 
ADD COLUMN IF NOT EXISTS user_status ENUM('active', 'flagged', 'suspended') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS risk_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS report_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_violation DATETIME NULL,
ADD COLUMN IF NOT EXISTS last_active DATETIME NULL;

-- 2. Ensure existing 'status' column is compatible (if it exists) or use user_status
-- User request specifically asked for user_status ENUM.
-- I will keep existing 'status' if it's there but the UI will use 'user_status'.

-- 3. Create Audit Log specifically for User Management (Audit Logging requirement)
CREATE TABLE IF NOT EXISTS tbl_user_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_name VARCHAR(255),
    action VARCHAR(255),
    target_user VARCHAR(255),
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
