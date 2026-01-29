
-- Session Management System
CREATE TABLE IF NOT EXISTS tbl_sessions (
    session_id VARCHAR(64) PRIMARY KEY, -- JWT ID or UUID
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL, -- Store hash of the token signature for validation
    ip_address VARCHAR(45),
    device_info TEXT, -- User Agent
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expiry_time TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_by INT, -- Admin ID who blocked it
    revoked_reason VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_session_user ON tbl_sessions(user_id);
CREATE INDEX idx_session_token ON tbl_sessions(token_hash);
CREATE INDEX idx_session_expiry ON tbl_sessions(expiry_time);
