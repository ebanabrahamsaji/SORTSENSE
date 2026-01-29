
import db from '../db.js';

// 1. Audit Logging
export const logAdminAction = async (adminId, actionType, targetType, targetId, details) => {
    try {
        await db.query(
            "INSERT INTO tbl_admin_audit_logs (admin_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)",
            [adminId || 0, actionType, targetType, targetId || 'N/A', JSON.stringify(details || {})]
        );
    } catch (e) {
        console.error("Audit Log Error:", e);
    }
};

// 1.5. Central Event Logging
export const logEvent = async (eventType, actor, target, payload, severity = 'INFO') => {
    try {
        await db.query(
            "INSERT INTO tbl_system_events (event_type, actor_id, actor_role, target_resource, target_id, payload, severity) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                eventType,
                actor.id || null,
                actor.role || null,
                target.resource || null,
                target.id || null,
                JSON.stringify(payload || {}),
                severity
            ]
        );
    } catch (e) {
        console.error("Event Log Error:", e);
    }
};

// 2. System Health Check
export const checkSystemHealth = async () => {
    try {
        const start = Date.now();
        await db.query("SELECT 1"); // DB Check
        const dbLatency = Date.now() - start;

        const uptime = process.uptime();
        const mem = process.memoryUsage();

        const healthStatus = (dbLatency < 500) ? 'HEALTHY' : 'DEGRADED';

        // Log health
        await db.query(
            "INSERT INTO tbl_system_health_logs (cpu_usage, memory_usage, active_connections, api_response_time_ms, status) VALUES (?, ?, ?, ?, ?)",
            [0, (mem.heapUsed / 1024 / 1024).toFixed(2), 0, dbLatency, healthStatus]
        );

        return {
            status: healthStatus,
            uptime: uptime,
            dbLatency: dbLatency,
            memory: mem.heapUsed,
            timestamp: new Date()
        };
    } catch (e) {
        return { status: 'CRITICAL', error: e.message };
    }
};

// 3. Flagging System
export const flagSuspiciousActivity = async (userId, type, details) => {
    // Logic:
    // - If scanning 'Hazardous' > 3 times in a day
    // - If > 50 scans in 1 hour

    try {
        let flagReason = null;
        let severity = 'LOW';

        if (type === 'SCAN') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (details.category === 'Hazardous' || details.category === 'Biomedical') {
                flagReason = `High risk waste scan: ${details.category}`;
                severity = 'HIGH';
            }

            // Check frequency
            const [rows] = await db.query(
                "SELECT COUNT(*) as c FROM tbl_user_history WHERE user_id = ? AND activity_type='SCAN' AND created_at > NOW() - INTERVAL 1 HOUR",
                [userId]
            );
            if (rows[0].c > 50) {
                flagReason = "Abnormal scan frequency (>50/hr)";
                severity = 'MEDIUM';
            }
        }

        if (flagReason) {
            await db.query(
                "INSERT INTO tbl_suspicious_flags (user_id, activity_type, reason, severity) VALUES (?, ?, ?, ?)",
                [userId, type, flagReason, severity]
            );
            return true;
        }
        return false;
    } catch (e) {
        console.error("Flag Error:", e);
        return false;
    }
};
