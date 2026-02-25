
import db from '../db.js';

// Helper to reconstruct disposal info from category if missing (Duplicated for modularity)
function getDisposalMethod(category) {
    const cat = String(category).toLowerCase();

    if (cat.includes('plastic')) return "Clean, dry, and give to Haritha Karma Sena.";
    if (cat.includes('organic')) return "Compost in bio-bin or community aerobic bin.";
    if (cat.includes('glass')) return "Rinse and hand over. Wrap broken glass.";
    if (cat.includes('metal')) return "Sell to scrap dealer.";
    if (cat.includes('ewaste') || cat.includes('e-waste')) return "Deposit at e-waste collection center.";
    if (cat.includes('hazardous')) return "Hand over to biomedical/hazardous collectors.";
    if (cat.includes('paper')) return "Bundle and sell to scrap dealer.";
    if (cat.includes('textile')) return "Donate or recycle.";

    return "Segregate responsibly.";
}

export const getUserScanHistory = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : req.query.userId; // Support both Auth middleware and query

        if (!userId) {
            return res.status(401).json({ message: "User ID required." });
        }

        // 1. Fetch User Stats (Eco Credits)
        const [users] = await db.query("SELECT green_score FROM tbl_users WHERE user_id = ?", [userId]);
        const ecoCredits = users.length > 0 ? users[0].green_score : 0;

        // 2. Fetch History Log
        // We use tbl_user_history as the source of truth
        const [logs] = await db.query(
            "SELECT * FROM tbl_user_history WHERE user_id = ? AND activity_type IN ('SCAN', 'SEARCH', 'BOT_CHAT') ORDER BY created_at DESC LIMIT 20",
            [userId]
        );

        // 3. Calculate Stats
        // To get total scans, we might need a separate count query if we want the TOTAL total, not just the last 20.
        const [countResult] = await db.query(
            "SELECT COUNT(*) as total FROM tbl_user_history WHERE user_id = ? AND activity_type = 'SCAN'",
            [userId]
        );
        const totalScans = countResult[0].total;

        // 4. Transform Logs
        const history = logs.map(log => {
            let details = {};
            try {
                details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
            } catch (e) {
                details = { category: "Unknown" };
            }

            const type = log.activity_type;
            let category = details.category || details.result || "Unknown";
            let confidence = details.confidence || 0;

            if (type === 'BOT_CHAT') {
                category = details.message || "Bot Query";
                confidence = 100;
            }

            return {
                id: log.history_id || log.id,
                type: type, // Explicitly pass type
                waste_category: category,
                confidence: typeof confidence === 'number' ? `${Math.round(confidence)}%` : confidence,
                disposal_method: type === 'BOT_CHAT' ? "Chatbot Interaction" : getDisposalMethod(category),
                timestamp: log.created_at
            };
        });

        // 5. Calculate Carbon Saved (Mock Logic: 0.2kg per scan)
        const carbonSaved = (totalScans * 0.2).toFixed(1);

        res.json({
            stats: {
                total_scans: totalScans,
                total_eco_credits: ecoCredits,
                total_carbon_saved: `${carbonSaved} kg`
            },
            history: history
        });

    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ message: "Failed to fetch history." });
    }
};
