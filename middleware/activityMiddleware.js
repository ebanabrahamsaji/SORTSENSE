import db from '../db.js';

export const trackCenterActivity = async (req, res, next) => {
    // Check if the request is from a center (this assumes we have center info in req.user or similar)
    // For now, we'll try to extract it from headers or body if present, 
    // but a more robust way is via JWT. 
    // Given the prompt rules "No login/session break", I'll check for centerId in commonly used fields.

    const centerId = req.headers['x-center-id'] || req.body.centerId || (req.user && req.user.center_id);
    const role = req.headers['x-user-role'] || (req.user && req.user.role);

    if (centerId && (role === 'CENTER' || !role)) {
        try {
            await db.query(
                "UPDATE tbl_collection_centers SET is_online = 1, last_seen = NOW(), center_status = 'online', last_active_time = NOW(), offline_since = NULL WHERE center_id = ?",
                [centerId]
            );
        } catch (err) {
            console.error("Activity tracking error:", err);
        }
    }
    next();
};
