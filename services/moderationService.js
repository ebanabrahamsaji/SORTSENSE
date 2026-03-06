import db from '../db.js';

// ── Status constants ─────────────────────────────────
export const USER_STATUS = {
    ACTIVE: 'active',
    FLAGGED: 'flagged',
    HIGH_RISK: 'high_risk',
    SUSPENDED: 'suspended'
};

// ── 4-Band Thresholds (match spec exactly) ───────────
//  0  – 20  → Active
//  21 – 50  → Flagged
//  51 – 80  → High Risk
//  81+      → Suspended (automatic)
const THRESHOLDS = {
    FLAG: 21,
    HIGH_RISK: 51,
    SUSPEND: 81
};

// ── Risk Score increments per event type ─────────────
export const RISK_SCORES = {
    FAKE_WASTE_REPORT: 10,   // Invalid / fake waste report
    PICKUP_CANCELLATION: 15,   // Repeated pickup cancellation
    SPAM_MESSAGE: 20,   // Spam messages to centers
    ABUSE_COMPLAINT: 25,   // Abuse complaint from a center
    MULTIPLE_REPORTS: 30,   // Multiple reports from centers/users
    DUPLICATE_ENTRY: 10,   // Duplicate scan (existing)
    FAILED_LOGINS: 10,   // Failed login batch (existing)
    INACTIVITY_VIOLATION: 10,   // Long inactivity + prior violation
};

class ModerationService {

    /**
     * Core method — apply a risk increment, recalculate status, persist.
     * @param {number} userId
     * @param {number} increment
     * @param {string} reason
     * @returns {{ userId, oldStatus, newStatus, newScore }}
     */
    async updateRiskScore(userId, increment, reason) {
        try {
            const [users] = await db.query(
                'SELECT user_status, risk_score, name FROM tbl_users WHERE user_id = ?',
                [userId]
            );
            if (!users.length) return null;

            const user = users[0];
            const oldScore = user.risk_score || 0;
            const newScore = Math.min(100, Math.max(0, oldScore + increment));
            const oldStatus = user.user_status || USER_STATUS.ACTIVE;
            const newStatus = this._scoreToStatus(newScore);

            // Persist risk_score + user_status + last_violation
            await db.query(
                'UPDATE tbl_users SET risk_score = ?, user_status = ?, last_violation = NOW() WHERE user_id = ?',
                [newScore, newStatus, userId]
            );

            // Keep legacy `status` column in sync
            if (newStatus === USER_STATUS.SUSPENDED) {
                await db.query("UPDATE tbl_users SET status = 'inactive' WHERE user_id = ?", [userId]);
            } else if (oldStatus === USER_STATUS.SUSPENDED && newStatus !== USER_STATUS.SUSPENDED) {
                await db.query("UPDATE tbl_users SET status = 'active' WHERE user_id = ?", [userId]);
            }

            // Audit trail
            await db.query(
                `INSERT INTO tbl_user_audit_logs (admin_name, action, target_user, reason)
                 VALUES (?, ?, ?, ?)`,
                ['SYSTEM', `AutoMod — Score: ${oldScore}→${newScore} | Status: ${oldStatus}→${newStatus}`, user.name, reason]
            ).catch(() => { });

            // Notify when status escalates
            if (newStatus !== oldStatus) {
                await this._notifyStatusChange(userId, user.name, newStatus, newScore, reason);
            }

            console.log(`[ModerationService] User ${userId} (${user.name}): score ${oldScore}→${newScore} | ${oldStatus}→${newStatus} | ${reason}`);
            return { userId, oldStatus, newStatus, oldScore, newScore };

        } catch (err) {
            console.error('[ModerationService] updateRiskScore error:', err.message);
            throw err;
        }
    }

    // ── Event Handlers (called from controllers) ────────

    /** Invalid / fake waste report submitted by user (+10) */
    async handleFakeWasteReport(userId, details = '') {
        return this.updateRiskScore(userId, RISK_SCORES.FAKE_WASTE_REPORT,
            `Fake/invalid waste report: ${details}`);
    }

    /** User cancelled a pickup request (+15) */
    async handlePickupCancellation(userId, requestId) {
        return this.updateRiskScore(userId, RISK_SCORES.PICKUP_CANCELLATION,
            `Pickup cancellation (Request #${requestId})`);
    }

    /** Spam messages detected in user→center channel (+20) */
    async handleSpamMessage(userId, details = '') {
        return this.updateRiskScore(userId, RISK_SCORES.SPAM_MESSAGE,
            `Spam message detected: ${details}`);
    }

    /** Abuse complaint filed by a center against a user (+25) */
    async handleCenterAbuseComplaint(userId, centerId, reason = '') {
        // Increment report_count as well
        await db.query(
            'UPDATE tbl_users SET report_count = report_count + 1 WHERE user_id = ?',
            [userId]
        ).catch(() => { });

        return this.updateRiskScore(userId, RISK_SCORES.ABUSE_COMPLAINT,
            `Abuse complaint from center #${centerId}: ${reason}`);
    }

    /** Multiple reports against a user (+30 per batch) */
    async handleMultipleReports(userId, reporterNote = '') {
        await db.query(
            'UPDATE tbl_users SET report_count = report_count + 1 WHERE user_id = ?',
            [userId]
        ).catch(() => { });

        return this.updateRiskScore(userId, RISK_SCORES.MULTIPLE_REPORTS,
            `Multiple reports filed: ${reporterNote}`);
    }

    /** Failed login spike (+10, only when count is a multiple of 5) */
    async handleFailedLogin(userId, count) {
        if (count >= 5 && count % 5 === 0) {
            return this.updateRiskScore(userId, RISK_SCORES.FAILED_LOGINS,
                `${count} failed login attempts`);
        }
    }

    /** Duplicate scan / content violation (existing hook kept) */
    async handleContentViolation(userId, type, details = '') {
        const scoreMap = {
            SPAM: RISK_SCORES.SPAM_MESSAGE,
            ABUSE: RISK_SCORES.ABUSE_COMPLAINT,
            FAKE_UPLOAD: RISK_SCORES.FAKE_WASTE_REPORT,
            DUPLICATE_ENTRY: RISK_SCORES.DUPLICATE_ENTRY,
        };
        const score = scoreMap[type] ?? 10;
        return this.updateRiskScore(userId, score, `Content violation (${type}): ${details}`);
    }

    /** Manual admin/center override — no score change, just status */
    async manualStatusUpdate(userId, newStatus, reason, adminName = 'Admin') {
        const [users] = await db.query(
            'SELECT name, user_status FROM tbl_users WHERE user_id = ?', [userId]
        );
        if (!users.length) throw new Error('User not found');

        await db.query(
            'UPDATE tbl_users SET user_status = ?, status = ? WHERE user_id = ?',
            [newStatus, newStatus === USER_STATUS.SUSPENDED ? 'inactive' : 'active', userId]
        );

        await db.query(
            `INSERT INTO tbl_user_audit_logs (admin_name, action, target_user, reason)
             VALUES (?, ?, ?, ?)`,
            [adminName, `Manual status → ${newStatus}`, users[0].name, reason]
        ).catch(() => { });
    }

    // ── Internal helpers ─────────────────────────────────

    /** Map a numeric score to the correct status band */
    _scoreToStatus(score) {
        if (score >= THRESHOLDS.SUSPEND) return USER_STATUS.SUSPENDED;
        if (score >= THRESHOLDS.HIGH_RISK) return USER_STATUS.HIGH_RISK;
        if (score >= THRESHOLDS.FLAG) return USER_STATUS.FLAGGED;
        return USER_STATUS.ACTIVE;
    }

    async _notifyStatusChange(userId, userName, newStatus, score, reason) {
        try {
            // Notify the user
            const userMessages = {
                [USER_STATUS.FLAGGED]: { title: 'Account Flagged', msg: 'Your account has been flagged for review due to policy violations.', type: 'INFO' },
                [USER_STATUS.HIGH_RISK]: { title: 'High Risk Warning', msg: 'Your account has been marked High Risk. Further violations may result in suspension.', type: 'ALERT' },
                [USER_STATUS.SUSPENDED]: { title: 'Account Suspended', msg: `Your account has been automatically suspended (risk score: ${score}). Reason: ${reason}`, type: 'ALERT' },
            };

            if (userMessages[newStatus]) {
                const { title, msg, type } = userMessages[newStatus];
                await db.query(
                    'INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                    [userId, title, msg, type]
                ).catch(() => { });
            }

            // Notify admin on suspension
            if (newStatus === USER_STATUS.SUSPENDED) {
                await db.query(
                    'INSERT INTO tbl_admin_notifications (type, title, message, reference_id) VALUES (?, ?, ?, ?)',
                    ['SECURITY', 'Auto-Suspension', `User "${userName}" auto-suspended. Risk Score: ${score}. Reason: ${reason}`, userId]
                ).catch(() => { });
            }
        } catch (e) {
            console.warn('[ModerationService] Notification error:', e.message);
        }
    }
}

export default new ModerationService();
