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

// Mark All Notifications Read
export const markAllNotificationsRead = async (req, res) => {
    const { userId } = req.params;
    try {
        await db.query("UPDATE tbl_notifications SET is_read = TRUE WHERE user_id = ?", [userId]);
        res.json({ message: "All marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notifications" });
    }
};

// Clear All Notifications
export const clearAllNotifications = async (req, res) => {
    const { userId } = req.params;
    try {
        await db.query("DELETE FROM tbl_notifications WHERE user_id = ?", [userId]);
        res.json({ message: "All notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: "Error clearing notifications" });
    }
};

// Get Full User History (Scans + Searches + Pickups)
export const getUserHistory = async (req, res) => {
    const userId = req.params.userId || req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId required" });
    try {
        // 1. Fetch System History (Scans/Searches/BotChats)
        let sysHistory = [];
        try {
            const [rows] = await db.query(
                "SELECT * FROM tbl_user_history WHERE user_id = ? ORDER BY created_at DESC",
                [userId]
            );
            sysHistory = rows || [];
        } catch (e) {
            console.warn("History query warning:", e.message);
        }

        // 2. Fetch Pickup Requests (separate try-catch so it never breaks the whole response)
        let pickups = [];
        try {
            const [rows] = await db.query(
                "SELECT * FROM tbl_pickup_requests WHERE user_id = ? ORDER BY created_at DESC",
                [userId]
            );
            pickups = rows || [];
        } catch (e) {
            console.warn("Pickup query warning:", e.message);
        }

        // 3. Merge & Format — always serialize details as a plain string so frontend JSON.parse is safe
        const formattedHistory = [
            ...sysHistory.map(h => ({
                id: `sys-${h.history_id}`,
                type: h.activity_type,
                details: typeof h.details === 'string' ? h.details : JSON.stringify(h.details || {}),
                date: h.created_at,
                status: 'Completed'
            })),
            ...pickups.map(p => ({
                id: `pup-${p.request_id}`,
                type: 'PICKUP',
                details: JSON.stringify({
                    wasteTypes: p.waste_type,
                    quantity: p.quantity,
                    centerId: p.center_id,
                    address: p.address || ''
                }),
                date: p.created_at,
                status: p.status
            }))
        ];

        // 4. Sort newest first
        formattedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 5. Always return array — never 500 for empty data
        res.json(formattedHistory);

    } catch (error) {
        console.error("Get History Error:", error);
        res.json([]); // Safe fallback: empty array, not 500
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
// Get User Environmental Impact Stats
export const getUserStats = async (req, res) => {
    const { userId } = req.params;
    try {
        // 1. Total waste collected (Completed only)
        const [rows] = await db.query(
            "SELECT SUM(quantity) as total_kg FROM tbl_pickup_requests WHERE user_id = ? AND status = 'Completed'",
            [userId]
        );
        const collectedKg = parseFloat(rows[0].total_kg || 0);

        // 2. Total waste submitted (All requests)
        const [subRows] = await db.query(
            "SELECT SUM(quantity) as total_kg FROM tbl_pickup_requests WHERE user_id = ?",
            [userId]
        );
        const submittedKg = parseFloat(subRows[0].total_kg || 0);

        // 3. Total completed pickups count
        const [countRows] = await db.query(
            "SELECT COUNT(*) as completed_count FROM tbl_pickup_requests WHERE user_id = ? AND status = 'Completed'",
            [userId]
        );
        const completedCount = countRows[0].completed_count || 0;

        // 4. Scan impact bonus
        const [scans] = await db.query(
            "SELECT COUNT(*) as scan_count FROM tbl_user_history WHERE user_id = ? AND activity_type = 'SCAN'",
            [userId]
        );
        const scanBonusKg = (scans[0].scan_count || 0) * 0.1;

        // Final Impact Metrics
        const finalWeightStr = (collectedKg + scanBonusKg).toFixed(1);
        const finalWeightNum = parseFloat(finalWeightStr);
        const co2 = (finalWeightNum * 2.1).toFixed(1);
        const trees = (parseFloat(co2) / 20).toFixed(1);

        res.json({
            totalWeight: finalWeightStr, // Legacy support
            collectedKg: collectedKg.toFixed(1),
            submittedKg: submittedKg.toFixed(1),
            completedCount: completedCount,
            co2Saved: co2,
            treesSaved: trees
        });
    } catch (error) {
        console.error("Stats Fetch Error:", error);
        res.status(500).json({ message: "Error fetching stats" });
    }
};

// Get Comprehensive Rewards Data
export const getUserRewards = async (req, res) => {
    const { userId } = req.params;
    try {
        const [users] = await db.query(
            "SELECT eco_credits as green_score, monthly_points, streak, carbon_saved_kg FROM tbl_users WHERE user_id = ?",
            [userId]
        );

        if (users.length === 0) return res.status(404).json({ message: "User not found" });
        const user = users[0];

        // Level Logic: 1000 XP per level
        const xp = user.green_score || 0;
        const level = Math.floor(xp / 1000) + 1;
        const xpInLevel = xp % 1000;
        const xpToNext = 1000;

        // Badge Calculations (Verified server-side)
        const [statsRows] = await db.query(
            "SELECT SUM(quantity) as total_kg FROM tbl_pickup_requests WHERE user_id = ? AND status = 'Completed'",
            [userId]
        );
        const totalWeight = parseFloat(statsRows[0].total_kg || 0);

        const badges = [
            { id: 'b1', name: "First Steps", unlocked: xp > 0 },
            { id: 'b2', name: "Recycling Pro", unlocked: totalWeight >= 50 },
            { id: 'b3', name: "Streak Master", unlocked: user.streak >= 7 },
            { id: 'b4', name: "Eco Legend", unlocked: level >= 5 }
        ];

        res.json({
            points: xp,
            monthlyPoints: user.monthly_points,
            streak: user.streak,
            level: level,
            xpInLevel: xpInLevel,
            xpToNext: xpToNext,
            badges: badges,
            unlockedCount: badges.filter(b => b.unlocked).length
        });

    } catch (error) {
        console.error("Rewards Fetch Error:", error);
        res.status(500).json({ message: "Error fetching rewards" });
    }
};
