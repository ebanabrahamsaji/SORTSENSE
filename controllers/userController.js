import db from '../db.js';

// Get User Notifications
export const getNotifications = async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await db.query(
            "SELECT * FROM tbl_notifications WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// Mark Notification Read
export const markNotificationRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE tbl_notifications SET is_read = TRUE WHERE notification_id = ?", [id]);
        res.json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notification" });
    }
};

// Get Full User History (Scans + Searches + Pickups)
export const getUserHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        // 1. Fetch System History (Scans/Searches)
        const [sysHistory] = await db.query(
            "SELECT * FROM tbl_user_history WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        // 2. Fetch Pickup Requests
        const [pickups] = await db.query(
            "SELECT * FROM tbl_pickup_requests WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        // 3. Merge & Format
        const formattedHistory = [
            ...sysHistory.map(h => ({
                id: `sys-${h.history_id}`,
                type: h.activity_type,
                details: h.details,
                date: h.created_at,
                status: 'Completed' // Searches/Scans are always 'done'
            })),
            ...pickups.map(p => ({
                id: `pup-${p.request_id}`,
                type: 'PICKUP',
                details: { wasteTypes: p.waste_type, quantity: p.quantity, centerId: p.center_id },
                date: p.created_at,
                status: p.status
            }))
        ];

        // Sort Combined
        formattedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(formattedHistory);

    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ message: "Error fetching history" });
    }
};

// Clear User History (Scans/Searches only)
export const clearUserHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        await db.query("DELETE FROM tbl_user_history WHERE user_id = ?", [userId]);
        res.json({ message: "Scan & Search history cleared." });
    } catch (error) {
        console.error("Clear History Error:", error);
        res.status(500).json({ message: "Error clearing history" });
    }
};
