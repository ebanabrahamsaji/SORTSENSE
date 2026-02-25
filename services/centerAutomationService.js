import db from '../db.js';

export const runCenterAutomation = async () => {
    try {
        // console.log("🤖 Running Center Automation Tasks...");

        // 1. Mark Idle: IF no activity for 30 minutes
        await db.query(`
            UPDATE tbl_collection_centers 
            SET center_status = 'idle' 
            WHERE center_status = 'online' 
            AND last_active_time < NOW() - INTERVAL 30 MINUTE
        `);

        // 2. Mark Offline: IF no activity for 4 hours (Safety Session Timeout)
        // This handles cases where center closed tab without logging out
        await db.query(`
            UPDATE tbl_collection_centers 
            SET center_status = 'offline', offline_since = NOW()
            WHERE center_status != 'offline' 
            AND last_active_time < NOW() - INTERVAL 4 HOUR
        `);

        // 3. Admin Alerts: IF center offline for more than 24 hours
        // We select centers that just hit the threshold to avoid spamming
        const [offlineTooLong] = await db.query(`
            SELECT center_id, center_name FROM tbl_collection_centers 
            WHERE center_status = 'offline' 
            AND offline_since < NOW() - INTERVAL 24 HOUR
            AND center_id NOT IN (
                SELECT reference_id FROM tbl_admin_notifications 
                WHERE type = 'ALERT' AND title = 'Center Offline Alert' AND created_at > NOW() - INTERVAL 24 HOUR
            )
        `);

        for (const center of offlineTooLong) {
            await db.query(
                "INSERT INTO tbl_admin_notifications (type, title, message, reference_id) VALUES (?, ?, ?, ?)",
                ['ALERT', 'Center Offline Alert', `Center '${center.center_name}' has been offline for over 24 hours.`, center.center_id]
            ).catch(() => { });
        }

        // 4. Update Performance Scores (Periodic - Every 1 hour)
        // We check if it's top of the hour to reduce load
        const now = new Date();
        if (now.getMinutes() < 5) { // Run roughly once an hour
            await calculatePerformanceScores();
        }

    } catch (err) {
        console.error("Center Automation Error:", err);
    }
};

const calculatePerformanceScores = async () => {
    try {
        const [centers] = await db.query("SELECT center_id FROM tbl_collection_centers");

        for (const center of centers) {
            const centerId = center.center_id;

            // Calculate Avg Response Time (minutes)
            const [respTimeRows] = await db.query(`
                SELECT AVG(TIMESTAMPDIFF(MINUTE, assigned_time, accepted_time)) as avg_resp
                FROM tbl_pickup_requests 
                WHERE center_id = ? AND accepted_time IS NOT NULL
            `, [centerId]);

            // Calculate Completion Rate
            const [rateRows] = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
                FROM tbl_pickup_requests 
                WHERE center_id = ?
            `, [centerId]);

            const avgResp = respTimeRows[0].avg_resp || 0;
            const total = rateRows[0].total || 0;
            const completed = rateRows[0].completed || 0;
            const completionRate = total > 0 ? (completed / total) * 100 : 100;

            // Score logic: Base 100, deduct for long response times and low completion
            let score = 100;

            // Deduct for response time (example: -1 point per 60 mins avg)
            score -= Math.min(30, Math.floor(avgResp / 60));

            // Deduct for completion rate gap
            score -= Math.min(70, Math.floor((100 - completionRate)));

            score = Math.max(0, Math.min(100, Math.round(score)));

            await db.query(
                "UPDATE tbl_collection_centers SET center_performance_score = ? WHERE center_id = ?",
                [score, centerId]
            );
        }
        // console.log("✅ Performance scores updated.");
    } catch (err) {
        console.error("Performance Score Calculation Error:", err);
    }
};
