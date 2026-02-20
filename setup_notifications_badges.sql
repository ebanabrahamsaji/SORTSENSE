-- ═══════════════════════════════════════════════════
-- SortSense — Notifications & Badges Schema
-- ═══════════════════════════════════════════════════

-- Notifications table
CREATE TABLE IF NOT EXISTS tbl_notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT,
    type        VARCHAR(50)  NOT NULL DEFAULT 'general',
    message     TEXT         NOT NULL,
    is_read     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- User Badges table
CREATE TABLE IF NOT EXISTS tbl_user_badges (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL,
    badge_id    VARCHAR(50)  NOT NULL,
    awarded_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_badge (user_id, badge_id),
    INDEX idx_user_id (user_id)
);

-- Add columns to tbl_users if they don't exist (safe ALTERs)
ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS total_scans   INT DEFAULT 0;
ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS total_pickups INT DEFAULT 0;
ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS google_id     VARCHAR(100) DEFAULT NULL;
ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS profile_pic   TEXT DEFAULT NULL;

SELECT 'Notifications & Badges tables created successfully!' AS status;
