
-- 1. Admin Audit Logs
CREATE TABLE IF NOT EXISTS tbl_admin_audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT, -- User ID of the admin
    action_type VARCHAR(50) NOT NULL, -- e.g., 'UPDATE_STATUS', 'DELETE_USER', 'ADD_CATEGORY'
    target_type VARCHAR(50), -- e.g., 'USER', 'PICKUP', 'CATEGORY'
    target_id VARCHAR(50), -- ID of the affected item
    details TEXT, -- JSON Details
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. System Health Logs
CREATE TABLE IF NOT EXISTS tbl_system_health_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    active_connections INT,
    api_response_time_ms INT,
    status ENUM('HEALTHY', 'DEGRADED', 'CRITICAL') DEFAULT 'HEALTHY',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. AI Performance Logs
CREATE TABLE IF NOT EXISTS tbl_ai_performance_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    image_id VARCHAR(255),
    predicted_category VARCHAR(100),
    confidence_score DECIMAL(5,4),
    user_feedback VARCHAR(50), -- 'CORRECT', 'INCORRECT'
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Suspicious Activity Flags
CREATE TABLE IF NOT EXISTS tbl_suspicious_flags (
    flag_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    activity_type VARCHAR(50), -- 'SCAN', 'REQUEST'
    reason TEXT, -- e.g., 'Rapid Scanning', 'Hazardous Waste Bulk'
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'REVIEWED', 'RESOLVED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
