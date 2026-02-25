
-- 1. Add Moderation Columns to tbl_users
ALTER TABLE tbl_users 
ADD COLUMN IF NOT EXISTS risk_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_attempt TIMESTAMP NULL;

-- 2. Create Moderation Logs Table
CREATE TABLE IF NOT EXISTS tbl_moderation_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    risk_score INT,
    triggered_by ENUM('SYSTEM', 'ADMIN') DEFAULT 'SYSTEM',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
);

-- Appeals table
CREATE TABLE IF NOT EXISTS tbl_moderation_appeals (
    appeal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id)
);

-- 3. Create User Reports Table (for "Reported by Users" requirement)
CREATE TABLE IF NOT EXISTS tbl_user_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    target_id INT NOT NULL,
    category ENUM('Spam', 'Fraud', 'Abuse', 'Other') DEFAULT 'Other',
    description TEXT,
    status ENUM('Pending', 'Resolved', 'Dismissed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
);
