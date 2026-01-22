
import db from '../db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [u] = await db.query('SELECT COUNT(*) as c FROM tbl_users');
        // Check for history table existence safely or just try/catch
        let itemsCount = 0;
        try {
            const [h] = await db.query('SELECT COUNT(*) as c FROM tbl_user_history WHERE activity_type="SCAN"');
            itemsCount = h[0].c;
        } catch (e) { }

        const [f] = await db.query('SELECT COUNT(*) as c FROM tbl_special_waste_requests WHERE category="Hazardous" OR category="Biomedical"');

        const uptime = process.uptime();
        let upStr = "";
        if (uptime < 60) upStr = Math.floor(uptime) + "s";
        else if (uptime < 3600) upStr = Math.floor(uptime / 60) + "m";
        else if (uptime < 86400) upStr = Math.floor(uptime / 3600) + "h " + Math.floor((uptime % 3600) / 60) + "m";
        else upStr = Math.floor(uptime / 86400) + "d " + Math.floor((uptime % 86400) / 3600) + "h";

        res.json({
            totalUsers: u[0].c,
            itemsSorted: itemsCount,
            flaggedItems: f[0].c,
            systemUptime: upStr
        });
    } catch (e) {
        console.error("Stats Error:", e);
        res.status(500).json({ totalUsers: 0, itemsSorted: 0, flaggedItems: 0, systemUptime: "Error" });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        // Fetch User History (Scans/Searches)
        let history = [];
        try {
            const [h] = await db.query(`
                SELECT u.name, h.activity_type, h.details, h.created_at, 'Analyzed' as status
                FROM tbl_user_history h JOIN tbl_users u ON h.user_id = u.user_id
                ORDER BY h.created_at DESC LIMIT 20
            `);
            history = h;
        } catch (e) { }

        // Fetch Regular Requests
        const [reqs] = await db.query(`
            SELECT u.name, 'Request' as activity_type, waste_type as details, r.created_at, r.status
            FROM tbl_pickup_requests r JOIN tbl_users u ON r.user_id = u.user_id
            ORDER BY r.created_at DESC LIMIT 20
        `);

        // Fetch Special Requests
        const [sReqs] = await db.query(`
            SELECT u.name, 'Special Request' as activity_type, category as details, r.created_at, r.status
            FROM tbl_special_waste_requests r JOIN tbl_users u ON r.user_id = u.user_id
            ORDER BY r.created_at DESC LIMIT 20
        `);

        let combined = [];

        // Helper to format actions
        const parseAction = (r) => {
            let action = '';
            let type = 'User';
            if (r.name.toLowerCase().includes('admin')) type = 'Admin';

            if (r.activity_type === 'SCAN') {
                action = 'Scanned Item';
                try {
                    const d = JSON.parse(r.details || '{}');
                    if (d.result) action += `: ${d.result}`;
                    else if (d.category) action += `: ${d.category}`;
                } catch (e) { }
            } else if (r.activity_type === 'SEARCH') {
                action = 'Searched';
                try {
                    const d = JSON.parse(r.details || '{}');
                    if (d.query) action += `: "${d.query}"`;
                } catch (e) { }
            } else if (r.activity_type.includes('Request')) {
                action = `${r.activity_type}: ${r.details || 'Waste'}`;
            }
            return { action, type };
        };

        const addToCombined = (list, source) => {
            list.forEach(r => {
                const { action, type } = parseAction(r);
                combined.push({
                    user: r.name,
                    userType: type,
                    action: action,
                    originalAction: action, // for grouping comparison
                    time: r.created_at,
                    status: r.status,
                    statusLabel: r.status,
                    timestamp: new Date(r.created_at).getTime(),
                    id: r.created_at + r.name // rough unique key
                });
            });
        };

        addToCombined(history, 'history');
        addToCombined(reqs, 'req');
        addToCombined(sReqs, 'special');

        // Sorting: Pending First, then Recent
        combined.sort((a, b) => {
            const aPending = a.status === 'Pending';
            const bPending = b.status === 'Pending';
            if (aPending && !bPending) return -1;
            if (!aPending && bPending) return 1;
            return b.timestamp - a.timestamp;
        });

        // Grouping
        const grouped = [];
        if (combined.length > 0) {
            let current = combined[0];
            let count = 1;

            for (let i = 1; i < combined.length; i++) {
                const next = combined[i];
                const timeDiff = Math.abs(current.timestamp - next.timestamp);
                // Group if: Same User, Same Action, Within 10 mins, AND NOT Pending (Don't group pending requests as they need individual action)
                if (current.user === next.user &&
                    current.originalAction === next.originalAction &&
                    timeDiff < 10 * 60 * 1000 &&
                    current.status !== 'Pending') {
                    count++;
                } else {
                    if (count > 1) {
                        current.action += ` (x${count})`;
                    }
                    grouped.push(current);
                    current = next;
                    count = 1;
                }
            }
            if (count > 1) current.action += ` (x${count})`;
            grouped.push(current);
        }

        // Slice for Widget
        const widgetData = grouped.slice(0, 10).map(c => {
            // Format Time
            const diff = (new Date() - new Date(c.time)) / 1000;
            let tStr = "Just now";
            if (diff > 60) tStr = Math.floor(diff / 60) + "m ago";
            if (diff > 3600) tStr = Math.floor(diff / 3600) + "h ago";
            if (diff > 86400) tStr = Math.floor(diff / 86400) + "d ago";
            return {
                user: c.user,
                action: c.action,
                time: tStr,
                status: c.status,
                statusLabel: c.status
            };
        });

        res.json(widgetData);

    } catch (e) {
        console.error("Activity Error:", e);
        res.status(500).json([]);
    }
};

export const getAllActivities = async (req, res) => {
    // Similar logic but without limits and with filters (Not fully implemented for prototype, reusing basic logic)
    // For now, return a larger set
    try {
        // Reusing logic for now but returning raw list without slice
        // Ideally this would be refactored into a shared internal function.
        // For speed, I'll copy-paste the query part with higher limits.

        const [h] = await db.query(`SELECT u.name, h.activity_type, h.details, h.created_at, 'Analyzed' as status FROM tbl_user_history h JOIN tbl_users u ON h.user_id = u.user_id ORDER BY h.created_at DESC LIMIT 100`);
        const [r] = await db.query(`SELECT u.name, 'Request' as activity_type, waste_type as details, r.created_at, r.status FROM tbl_pickup_requests r JOIN tbl_users u ON r.user_id = u.user_id ORDER BY r.created_at DESC LIMIT 100`);
        const [s] = await db.query(`SELECT u.name, 'Special Request' as activity_type, category as details, r.created_at, r.status FROM tbl_special_waste_requests r JOIN tbl_users u ON r.user_id = u.user_id ORDER BY r.created_at DESC LIMIT 100`);

        let list = [];
        // ... Merge logic ...
        const merge = (arr) => arr.forEach(x => {
            let action = x.activity_type;
            if (x.activity_type === 'SCAN') try { action = "Scanned: " + JSON.parse(x.details).result } catch (e) { }
            else if (x.activity_type === 'SEARCH') try { action = "Searched: " + JSON.parse(x.details).query } catch (e) { }
            else if (x.activity_type.includes('Request')) action = x.activity_type + ": " + x.details;

            list.push({
                user: x.name,
                action: action,
                time: x.created_at,
                status: x.status
            })
        });

        merge(h); merge(r); merge(s);
        list.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(list);

    } catch (e) { res.status(500).json([]); }
};

export const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query("SELECT user_id, name, email, role, status, created_at FROM tbl_users ORDER BY created_at DESC");
        res.json(users);
    } catch (e) {
        console.error("Fetch Users Error:", e);
        res.status(500).json({ message: "Fetch users error" });
    }
};

export const updateUserStatus = async (req, res) => {
    const { userId, status } = req.body;
    try {
        await db.query("UPDATE tbl_users SET status = ? WHERE user_id = ?", [status, userId]);
        res.json({ message: "Status updated" });
    } catch (e) {
        console.error("Update User Error:", e);
        res.status(500).json({ message: "Update failed" });
    }
};
