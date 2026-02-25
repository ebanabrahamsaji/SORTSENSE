import db from '../db.js';

export const OPERATIONAL_STATUS = {
    OPEN: 'OPEN',
    IDLE: 'IDLE',
    CLOSED: 'CLOSED'
};

class CenterStatusService {
    /**
     * Mark center as active/open when a manager logs in or performs an action
     */
    async updateActivity(centerId) {
        if (!centerId) return;
        try {
            await db.query(`
                UPDATE tbl_collection_centers 
                SET is_logged_in = TRUE, 
                    current_operational_status = ?, 
                    status = ?,
                    last_active_at = NOW(),
                    last_seen_at = NOW(),
                    last_activity = NOW()
                WHERE center_id = ?
            `, [OPERATIONAL_STATUS.OPEN, OPERATIONAL_STATUS.OPEN, centerId]);
        } catch (err) {
            console.error(`[CenterStatusService] Error updating activity for ${centerId}:`, err);
        }
    }

    /**
     * Heartbeat implementation - only updates timestamp
     */
    async heartbeat(centerId) {
        if (!centerId) return;
        try {
            await db.query(`
                UPDATE tbl_collection_centers 
                SET last_activity = NOW(), 
                    is_logged_in = TRUE 
                WHERE center_id = ?
            `, [centerId]);
        } catch (err) {
            console.error(`[CenterStatusService] Heartbeat Error for center ${centerId}:`, err);
        }
    }

    /**
     * Mark center as closed on logout
     */
    async setClosed(centerId) {
        if (!centerId) return;
        try {
            await db.query(`
                UPDATE tbl_collection_centers 
                SET is_logged_in = FALSE, 
                    current_operational_status = ?,
                    status = ?
                WHERE center_id = ?
            `, [OPERATIONAL_STATUS.CLOSED, OPERATIONAL_STATUS.CLOSED, centerId]);
        } catch (err) {
            console.error(`[CenterStatusService] Error setting closed for ${centerId}:`, err);
        }
    }

    /**
     * Automated status processing (Runs every 1 min)
     * Rules:
     * 1. OPEN (🟢): logged in AND last activity < 10 mins
     * 2. IDLE (⚠): logged in AND last activity 10-30 mins
     * 3. CLOSED (🔴): logged out OR last activity > 30 mins
     */
    async processStatusAutomation() {
        try {
            const now = Date.now();
            if (this._lastRun && (now - this._lastRun) < 20000) return;
            this._lastRun = now;

            console.log("🕒 [CenterStatusService] Running operational status automation...");

            // 1. OPEN -> IDLE (10 - 30 min inactivity)
            await db.query(`
                UPDATE tbl_collection_centers 
                SET current_operational_status = ?, status = ?
                WHERE is_logged_in = TRUE 
                AND last_activity < DATE_SUB(NOW(), INTERVAL 10 MINUTE)
                AND last_activity >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
                AND current_operational_status != ?
            `, [OPERATIONAL_STATUS.IDLE, OPERATIONAL_STATUS.IDLE, OPERATIONAL_STATUS.IDLE]);

            // 2. IDLE/OPEN -> CLOSED (> 30 min inactivity)
            const [autoClosed] = await db.query(`
                UPDATE tbl_collection_centers 
                SET is_logged_in = FALSE, current_operational_status = ?, status = ?
                WHERE is_logged_in = TRUE 
                AND last_activity < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
            `, [OPERATIONAL_STATUS.CLOSED, OPERATIONAL_STATUS.CLOSED]);

            if (autoClosed.affectedRows > 0) {
                console.log(`📡 [CenterStatusService] Auto-closed ${autoClosed.affectedRows} inactive centers (> 30m).`);
            }

            // 3. Performance Metrics
            await this.updateAllPerformanceMetrics();

            // 4. Alerts for centers inactive for too long (e.g. IDLE > 15 mins)
            const [idleAlerts] = await db.query(`
                SELECT center_id, center_name, last_activity
                FROM tbl_collection_centers
                WHERE current_operational_status = 'IDLE'
                AND last_activity < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
            `);

            for (const c of idleAlerts) {
                await this.triggerAdminAlert('CENTER_WARNING', 'Center Inactivity Warning',
                    `Center "${c.center_name}" has been IDLE for too long. Inactive for > 15 mins.`, c.center_id);
            }
        } catch (err) {
            console.error("[CenterStatusService] Automation Error:", err);
        }
    }

    /**
     * Calculate and store response time when a center replies to an admin message
     */
    async calculateResponseTime(centerId, messageId) {
        try {
            // Find the most recent admin message to this center that hasn't been "answered" yet or just the last one
            const [adminMsgs] = await db.query(`
                SELECT created_at FROM tbl_center_messages 
                WHERE center_id = ? AND sender_role = 'ADMIN' 
                AND created_at < (SELECT created_at FROM tbl_center_messages WHERE message_id = ?)
                ORDER BY created_at DESC LIMIT 1
            `, [centerId, messageId]);

            if (adminMsgs.length > 0) {
                const sentTime = new Date(adminMsgs[0].created_at);
                const replyTime = new Date();
                const diffSecs = Math.floor((replyTime - sentTime) / 1000);
                const diffMins = Math.floor(diffSecs / 60);

                await db.query(`
                    UPDATE tbl_center_messages SET response_time = ? WHERE message_id = ?
                `, [diffMins, messageId]);

                return diffMins;
            }
        } catch (err) {
            console.error("[CenterStatusService] Response Time Calc Error:", err);
        }
        return null;
    }

    async triggerAdminAlert(type, title, message, refId) {
        try {
            const adminCtrl = await import('../controllers/adminController.js');
            if (adminCtrl.createAdminNotification) {
                await adminCtrl.createAdminNotification(type, title, message, refId);
            }
        } catch (err) {
            console.error("[CenterStatusService] Alert Trigger Error:", err);
        }
    }

    /**
     * Recalculate performance metrics using a single aggregate JOIN for O(1) database impact instead of O(N)
     */
    async updateAllPerformanceMetrics() {
        try {
            // Use an aggregate subquery to update all centers at once
            // This calculates average minutes between creation and completion for all requests.
            await db.query(`
                UPDATE tbl_collection_centers c
                LEFT JOIN (
                    SELECT 
                        center_id, 
                        AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_time,
                        COUNT(*) as total_handled
                    FROM tbl_pickup_requests 
                    WHERE status = 'Completed'
                    GROUP BY center_id
                ) r ON c.center_id = r.center_id
                SET c.avg_response_time = IFNULL(r.avg_time, 0)
            `);

            console.log("📊 [CenterStatusService] Performance metrics synced globally.");
        } catch (err) {
            console.error("[CenterStatusService] Metrics Update Error:", err);
        }
    }

    /**
     * Send message from Admin to Center
     */
    async sendAdminMessage(adminId, centerId, text) {
        try {
            await db.query(`
                INSERT INTO tbl_center_messages (sender_id, center_id, message_text)
                VALUES (?, ?, ?)
            `, [adminId, centerId, text]);

            // Proactive Status Reset: If messaging a CLOSED center, maybe it's an alert
            // (Business logic: could trigger an external notification here)
        } catch (err) {
            console.error("[CenterStatusService] Messaging Error:", err);
            throw err;
        }
    }

    async getCenterMessages(centerId) {
        const [rows] = await db.query(`
            SELECT m.*, u.name as admin_name 
            FROM tbl_center_messages m
            LEFT JOIN tbl_users u ON m.sender_id = u.user_id
            WHERE m.center_id = ? OR m.center_id IS NULL
            ORDER BY m.created_at DESC
        `, [centerId]);
        return rows;
    }
}

export default new CenterStatusService();
