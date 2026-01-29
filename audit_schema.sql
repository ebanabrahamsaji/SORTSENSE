
-- Central Event Log for Audit Trail, Compliance, and Replay
CREATE TABLE IF NOT EXISTS tbl_system_events (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'USER_LOGIN', 'PICKUP_REQUEST_CREATED', 'STATUS_CHANGE', 'ADMIN_ACTION'
    actor_id INT, -- User ID who performed the action (NULL for system)
    actor_role VARCHAR(50), -- Role at the time of action
    target_resource VARCHAR(50), -- e.g., 'PICKUP_REQUEST', 'USER_PROFILE'
    target_id VARCHAR(50), -- ID of the resource
    payload JSON, -- Full details of the event (before/after state)
    ip_address VARCHAR(45),
    user_agent TEXT,
    severity ENUM('INFO', 'WARNING', 'CRITICAL', 'SECURITY') DEFAULT 'INFO',
    hash VARCHAR(64), -- SHA256 integrity hash of the event content
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster auditing
CREATE INDEX idx_event_type ON tbl_system_events(event_type);
CREATE INDEX idx_actor_id ON tbl_system_events(actor_id);
CREATE INDEX idx_created_at ON tbl_system_events(created_at);

-- Security Logs (Specific for Auth/Security Events)
CREATE TABLE IF NOT EXISTS tbl_security_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event VARCHAR(100), -- 'FAILED_LOGIN', 'PASSWORD_CHANGE', 'API_ABUSE'
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
