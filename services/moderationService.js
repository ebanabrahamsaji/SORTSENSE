import db from '../db.js';

export const USER_STATUS = {
    ACTIVE: 'active',
    FLAGGED: 'flagged',
    SUSPENDED: 'suspended'
};

const THRESHOLDS = {
    FLAG: 40,
    SUSPEND: 70
};

class ModerationService {
    /**
     * Update a user's risk score and automatically transition status.
     * @param {number} userId 
     * @param {number} increment 
     * @param {string} reason 
     */
    async updateRiskScore(userId, increment, reason) {
        try {
            // 1. Get current status and score
            const [users] = await db.query("SELECT user_status, risk_score, name FROM tbl_users WHERE user_id = ?", [userId]);
            if (users.length === 0) return;

            const user = users[0];
            const currentScore = user.risk_score || 0;
            const newScore = Math.max(0, currentScore + increment);

            // 2. Determine new status based on thresholds
            let newStatus = user.user_status;

            if (newScore >= THRESHOLDS.SUSPEND) {
                newStatus = USER_STATUS.SUSPENDED;
            } else if (newScore >= THRESHOLDS.FLAG) {
                newStatus = USER_STATUS.FLAGGED;
            } else {
                newStatus = USER_STATUS.ACTIVE;
            }

            // 3. Update User
            await db.query(
                "UPDATE tbl_users SET risk_score = ?, user_status = ?, last_violation = NOW() WHERE user_id = ?",
                [newScore, newStatus, userId]
            );

            // Update legacy status for backward compatibility
            if (newStatus === USER_STATUS.SUSPENDED) {
                await db.query("UPDATE tbl_users SET status = 'inactive' WHERE user_id = ?", [userId]);
            } else if (user.user_status === USER_STATUS.SUSPENDED && newStatus !== USER_STATUS.SUSPENDED) {
                await db.query("UPDATE tbl_users SET status = 'active' WHERE user_id = ?", [userId]);
            }

            // 4. Audit Log
            await db.query(`
                INSERT INTO tbl_user_audit_logs (admin_name, action, target_user, reason) 
                VALUES (?, ?, ?, ?)`,
                ['SYSTEM', `Auto-moderation (Score: ${newScore})`, user.name, reason]
            );

            // 5. System notification for suspension
            if (newStatus === USER_STATUS.SUSPENDED && user.user_status !== USER_STATUS.SUSPENDED) {
                await this.notifyAdmins(userId, `User "${user.name}" auto-suspended. Risk Score: ${newScore}. Reason: ${reason}`);
                await this.notifyUser(userId, 'Account Suspended', `Your account has been suspended due to policy violations: ${reason}`, 'ALERT');
            } else if (newStatus === USER_STATUS.FLAGGED && user.user_status !== USER_STATUS.FLAGGED) {
                await this.notifyUser(userId, 'Account Flagged', `Your account has been flagged for review. Please ensure you follow the platform rules.`, 'INFO');
            }

            return { userId, oldStatus: user.user_status, newStatus, newScore };
        } catch (err) {
            console.error("ModerationService Error:", err);
            throw err;
        }
    }

    async notifyAdmins(userId, message) {
        try {
            await db.query(
                "INSERT INTO tbl_admin_notifications (type, title, message, reference_id) VALUES (?, ?, ?, ?)",
                ['SECURITY', 'Automatic Suspension', message, userId]
            );
        } catch (e) {
            console.warn("Failed to create admin notification:", e.message);
        }
    }

    async notifyUser(userId, title, message, type = 'INFO') {
        try {
            await db.query(
                "INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [userId, title, message, type]
            );
        } catch (e) {
            console.warn("Failed to create user notification:", e.message);
        }
    }

    /**
     * Increase report count and risk score
     */
    async handleReport(targetId, reason) {
        await db.query("UPDATE tbl_users SET report_count = report_count + 1 WHERE user_id = ?", [targetId]);
        return await this.updateRiskScore(targetId, 15, `User reported: ${reason}`);
    }

    /**
     * Handle failed login attempt
     */
    async handleFailedLogin(userId, count) {
        if (count >= 5 && count % 5 === 0) {
            return await this.updateRiskScore(userId, 10, `${count} failed login attempts detected`);
        }
    }

    /**
     * Handle content violation (spam, abuse, fake uploads)
     */
    async handleContentViolation(userId, type, details = '') {
        const scores = {
            'SPAM': 15,
            'ABUSE': 20,
            'FAKE_UPLOAD': 25,
            'DUPLICATE_ENTRY': 10
        };
        const score = scores[type] || 10;
        const reason = `Content violation (${type}): ${details}`;
        return await this.updateRiskScore(userId, score, reason);
    }

    /**
     * Manual Override by Admin
     */
    async manualStatusUpdate(userId, newStatus, reason, adminName = 'Admin') {
        const [users] = await db.query("SELECT name, user_status FROM tbl_users WHERE user_id = ?", [userId]);
        if (users.length === 0) throw new Error("User not found");

        const user = users[0];

        await db.query(
            "UPDATE tbl_users SET user_status = ?, status = ? WHERE user_id = ?",
            [newStatus, newStatus === USER_STATUS.SUSPENDED ? 'inactive' : 'active', userId]
        );

        await db.query(`
            INSERT INTO tbl_user_audit_logs (admin_name, action, target_user, reason) 
            VALUES (?, ?, ?, ?)`,
            [adminName, `Manual Status Change to ${newStatus}`, user.name, reason]
        );
    }
}

export default new ModerationService();
