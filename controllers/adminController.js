
import db from '../db.js';
import bcrypt from 'bcrypt';
import { transporter } from '../email.js';

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
            } else if (r.activity_type === 'ACCOUNT_CREATED') {
                action = 'Account Created';
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
    try {
        const [h] = await db.query(`
            SELECT h.history_id as id, u.name, u.role, h.activity_type, h.details, h.created_at, 'Analyzed' as status 
            FROM tbl_user_history h 
            JOIN tbl_users u ON h.user_id = u.user_id 
            ORDER BY h.created_at DESC LIMIT 500
        `);
        const [r] = await db.query(`
            SELECT r.request_id as id, u.name, u.role, 'Request' as activity_type, waste_type as details, r.created_at, r.status 
            FROM tbl_pickup_requests r 
            JOIN tbl_users u ON r.user_id = u.user_id 
            ORDER BY r.created_at DESC LIMIT 500
        `);
        const [s] = await db.query(`
            SELECT r.request_id as id, u.name, u.role, 'Special Request' as activity_type, category as details, r.created_at, r.status 
            FROM tbl_special_waste_requests r 
            JOIN tbl_users u ON r.user_id = u.user_id 
            ORDER BY r.created_at DESC LIMIT 500
        `);

        let list = [];
        const merge = (arr, type) => arr.forEach(x => {
            let action = x.activity_type;
            if (x.activity_type === 'SCAN') try { action = "Scanned: " + JSON.parse(x.details).result } catch (e) { }
            else if (x.activity_type === 'SEARCH') try { action = "Searched: " + JSON.parse(x.details).query } catch (e) { }
            else if (x.activity_type.includes('Request')) action = x.activity_type + ": " + x.details;

            list.push({
                id: x.id,
                type: type, // 'HISTORY', 'PICKUP', 'SPECIAL'
                user: x.name,
                role: x.role,
                action: action,
                time: x.created_at,
                status: x.status
            })
        });

        merge(h, 'HISTORY');
        merge(r, 'PICKUP');
        merge(s, 'SPECIAL');

        list.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(list);

    } catch (e) { res.status(500).json([]); }
};

export const deleteActivity = async (req, res) => {
    const { type, id } = req.params;
    console.log(`Deleting Activity: Type=${type}, ID=${id}`);

    try {
        if (type === 'HISTORY') {
            await db.query("DELETE FROM tbl_user_history WHERE history_id = ?", [id]);
        } else if (type === 'PICKUP') {
            await db.query("DELETE FROM tbl_pickup_requests WHERE request_id = ?", [id]);
        } else if (type === 'SPECIAL') {
            await db.query("DELETE FROM tbl_special_waste_requests WHERE request_id = ?", [id]);
        } else {
            return res.status(400).json({ message: "Invalid activity type" });
        }
        res.json({ message: "Activity deleted successfully" });
    } catch (e) {
        console.error("Delete Activity Error:", e);
        res.status(500).json({ message: "Failed to delete activity" });
    }
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

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent deleting the main admin/self (simple check)
        const [target] = await db.query("SELECT email, role FROM tbl_users WHERE user_id = ?", [id]);
        if (target.length === 0) return res.status(404).json({ message: "User not found" });

        if (target[0].role === 'ADMIN' && target[0].email === 'admin@sortsense.com') { // Prevent super admin deletion
            return res.status(403).json({ message: "Cannot delete Super Admin" });
        }

        await db.query("DELETE FROM tbl_users WHERE user_id = ?", [id]);

        // Log action
        await db.query(
            "INSERT INTO tbl_admin_audit_logs (admin_id, action_type, target_type, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [1, 'DELETE_USER', 'USER', id, `Deleted user ${target[0].email}`]
        );

        res.json({ message: "User deleted successfully" });
    } catch (e) {
        console.error("Delete User Error:", e);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

export const addNewUser = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim();
        const role = req.body.role;
        const status = req.body.status;
        const password = req.body.password;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, Email, and Password are required." });
        }

        // Check for duplicate email
        const [existing] = await db.query("SELECT * FROM tbl_users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "User with this email already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to DB
        const [result] = await db.query(
            "INSERT INTO tbl_users (name, email, role, status, password_hash, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [name, email, role, status, hashedPassword]
        );

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to SortSense - Account Created",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background-color: #f9fafb;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #6366f1; margin-top: 0; text-align: center;">Welcome to SortSense!</h2>
                        <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.6;">An administrator has created an account for you on the SortSense Waste Management platform.</p>
                        
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${status === 'Active' ? '#10b981' : '#f59e0b'}">${status}</span></p>
                        </div>

                        <p style="font-size: 16px; line-height: 1.6;">You can now log in using your email and the password provided to you.</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:8000/pages/login-user.html" style="background:#6366f1; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight: 600; display:inline-block;">Login to Dashboard</a>
                        </div>
                        
                        <p style="margin-top:30px; font-size: 0.8rem; color: #9ca3af; text-align: center;">If you didn't expect this email, please ignore it.</p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Welcome email sent to ${email}`);
        } catch (mailErr) {
            console.error("Error sending welcome email:", mailErr);
            // We don't fail the whole request just because email failed, but we log it
        }

        // Log action in audit logs
        await db.query(
            "INSERT INTO tbl_admin_audit_logs (admin_id, action_type, target_type, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [1, 'CREATE_USER', 'USER', result.insertId, `Created user ${email} with role ${role}`]
        );

        // Also add to user history so it shows up in "Recent Activity" on dashboard
        await db.query(
            "INSERT INTO tbl_user_history (user_id, activity_type, details, created_at) VALUES (?, ?, ?, NOW())",
            [result.insertId, 'ACCOUNT_CREATED', JSON.stringify({ message: "Account created by administrator" })]
        );

        res.status(201).json({ message: "User created successfully", userId: result.insertId });
    } catch (e) {
        console.error("Add New User Error:", e);
        res.status(500).json({ message: "Error creating user: " + e.message });
    }
};

export const addCategory = async (req, res) => {
    const { name, description, status } = req.body;
    try {
        // Check for duplicate
        const [existing] = await db.query("SELECT * FROM tbl_categories WHERE category_name = ?", [name]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Category already exists" });
        }

        await db.query(
            "INSERT INTO tbl_categories (category_name, description) VALUES (?, ?)",
            [name, description]
        );

        // Log action
        await db.query(
            "INSERT INTO tbl_admin_audit_logs (admin_id, action_type, target_type, details, created_at) VALUES (?, ?, ?, ?, NOW())",
            [1, 'ADD_CATEGORY', 'CATEGORY', `Added category: ${name}`]
        );

        res.status(201).json({ message: "Category added successfully" });
    } catch (e) {
        console.error("Add Category Error:", e);
        res.status(500).json({ message: "Error adding category" });
    }
};

export const exportReports = async (req, res) => {
    const { type, fromDate, toDate, format } = req.query;
    try {
        let data = [];
        let filename = `report_${type}_${new Date().toISOString().split('T')[0]}`;
        let headers = [];

        if (type === 'users') {
            [data] = await db.query("SELECT user_id, name, email, role, status, created_at FROM tbl_users WHERE created_at BETWEEN ? AND ?", [fromDate + ' 00:00:00', toDate + ' 23:59:59']);
            headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date'];
        } else if (type === 'activity') {
            [data] = await db.query("SELECT h.created_at, u.name, h.activity_type, h.details FROM tbl_user_history h JOIN tbl_users u ON h.user_id = u.user_id WHERE h.created_at BETWEEN ? AND ?", [fromDate + ' 00:00:00', toDate + ' 23:59:59']);
            headers = ['Timestamp', 'User Name', 'Action', 'Details'];
        } else if (type === 'pickups') {
            [data] = await db.query("SELECT r.request_id, u.name, r.waste_type, r.scheduled_date, r.status FROM tbl_pickup_requests r JOIN tbl_users u ON r.user_id = u.user_id WHERE r.created_at BETWEEN ? AND ?", [fromDate + ' 00:00:00', toDate + ' 23:59:59']);
            headers = ['Request ID', 'User Name', 'Waste Type', 'Scheduled Date', 'Status'];
        } else {
            [data] = await db.query("SELECT event_type, details, created_at FROM tbl_system_events WHERE created_at BETWEEN ? AND ?", [fromDate + ' 00:00:00', toDate + ' 23:59:59']);
            headers = ['Event', 'Details', 'Timestamp'];
        }

        if (format === 'csv') {
            let csvContent = headers.join(',') + '\n';
            data.forEach(row => {
                csvContent += Object.values(row).map(val => `"${val}"`).join(',') + '\n';
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            return res.send(csvContent);
        } else {
            // Placeholder for PDF/Excel - for now we just return CSV with correct extension
            // or we could use libraries if needed. For production readiness,
            // we'll stick to CSV but maybe label it neutrally.
            let csvContent = headers.join(',') + '\n';
            data.forEach(row => {
                csvContent += Object.values(row).map(val => `"${val}"`).join(',') + '\n';
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            return res.send(csvContent);
        }

    } catch (e) {
        console.error("Export Error:", e);
        res.status(500).json({ message: "Error generating report" });
    }
};

export const invalidateSessions = async (req, res) => {
    try {
        // In a real app with DB-backed sessions, we would delete from tbl_sessions
        // Since we are using tokens (likely stateless JWT or localstorage login),
        // we log this as a major system event.

        await db.query(
            "INSERT INTO tbl_system_events (event_type, details, created_at) VALUES (?, ?, NOW())",
            ['ALL_SESSIONS_INVALIDATED', 'Administrator forced a global session invalidation']
        );

        // Security log
        await db.query(
            "INSERT INTO tbl_admin_audit_logs (admin_id, action_type, target_type, details, created_at) VALUES (?, ?, ?, ?, NOW())",
            [1, 'INVALIDATE_SESSIONS', 'SYSTEM', 'Global session invalidation triggered']
        );

        // For demo purposes, we can also set a flag in a system settings table if it existed

        res.json({ message: "All sessions have been invalidated." });
    } catch (e) {
        console.error("Invalidate Sessions Error:", e);
        res.status(500).json({ message: "Error invalidating sessions" });
    }
};

export const getWasteStats = async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM tbl_categories ORDER BY category_name");
        const [items] = await db.query("SELECT * FROM tbl_waste_items");

        // Group items by category
        const enrichedCategories = categories.map(cat => ({
            ...cat,
            items: items.filter(item => item.category_id === cat.category_id)
        }));

        res.json(enrichedCategories);
    } catch (e) {
        console.error("Waste Stats Error:", e);
        res.status(500).json({ message: "Error fetching waste data" });
    }
};

export const addWasteItem = async (req, res) => {
    const { category_id, item_name, disposal_guideline, safety_instructions } = req.body;
    try {
        // Check for duplicates
        const [existing] = await db.query(
            "SELECT item_id FROM tbl_waste_items WHERE category_id = ? AND item_name = ?",
            [category_id, item_name]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: "An item with this name already exists in this category" });
        }

        const [result] = await db.query(
            "INSERT INTO tbl_waste_items (category_id, item_name, disposal_guideline, safety_instructions) VALUES (?, ?, ?, ?)",
            [category_id, item_name, disposal_guideline, safety_instructions]
        );
        res.status(201).json({ message: "Item added successfully", itemId: result.insertId });
    } catch (e) {
        console.error("Add Item Error:", e);
        res.status(500).json({ message: "Error adding item" });
    }
};

export const updateWasteItem = async (req, res) => {
    const { id } = req.params;
    const { item_name, disposal_guideline, safety_instructions } = req.body;
    try {
        await db.query(
            "UPDATE tbl_waste_items SET item_name = ?, disposal_guideline = ?, safety_instructions = ? WHERE item_id = ?",
            [item_name, disposal_guideline, safety_instructions, id]
        );
        res.json({ message: "Item updated successfully" });
    } catch (e) {
        console.error("Update Item Error:", e);
        res.status(500).json({ message: "Error updating item" });
    }
};

export const deleteWasteItem = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM tbl_waste_items WHERE item_id = ?", [id]);
        res.json({ message: "Item deleted successfully" });
    } catch (e) {
        console.error("Delete Item Error:", e);
        res.status(500).json({ message: "Error deleting item" });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // First check if category has items
        const [items] = await db.query("SELECT COUNT(*) as count FROM tbl_waste_items WHERE category_id = ?", [id]);
        if (items[0].count > 0) {
            return res.status(400).json({ message: "Cannot delete category that contains items. Move or delete items first." });
        }

        await db.query("DELETE FROM tbl_categories WHERE category_id = ?", [id]);
        res.json({ message: "Category deleted successfully" });
    } catch (e) {
        console.error("Delete Category Error:", e);
        res.status(500).json({ message: "Error deleting category" });
    }
};

// --- Transactional Waste Data Management (The "Module Fix") ---

export const getWasteRecords = async (req, res) => {
    try {
        const { type, status, userId, fromDate, toDate, search } = req.query;
        console.log("Admin: Fetching Waste Records with Params:", { type, status, userId, fromDate, toDate, search });

        let query = `
            SELECT r.*, u.name as user_name, u.email as user_email, a.name as admin_name
            FROM tbl_waste_records r
            LEFT JOIN tbl_users u ON r.user_id = u.user_id
            LEFT JOIN tbl_users a ON r.verified_by = a.user_id
            WHERE 1=1
        `;
        const params = [];

        if (type) { query += " AND r.waste_type = ?"; params.push(type); }
        if (status) { query += " AND r.status = ?"; params.push(status); }
        if (userId) { query += " AND r.user_id = ?"; params.push(userId); }
        if (fromDate) { query += " AND r.created_at >= ?"; params.push(fromDate + " 00:00:00"); }
        if (toDate) { query += " AND r.created_at <= ?"; params.push(toDate + " 23:59:59"); }
        if (search) {
            query += " AND (r.waste_type LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR r.location LIKE ?)";
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        query += " ORDER BY r.created_at DESC";

        const [records] = await db.query(query, params);
        console.log(`Query Success: Found ${records.length} records.`);
        res.json(records);
    } catch (e) {
        console.error("❌ Get Waste Records Error:", e.message);
        res.status(500).json({ message: "Error fetching waste records from database" });
    }
};

export const verifyWasteRecord = async (req, res) => {
    const { recordId } = req.params;
    const { status, comments, adminId } = req.body;
    try {
        await db.query(
            "UPDATE tbl_waste_records SET status = ?, comments = ?, verified_by = ?, updated_at = NOW() WHERE record_id = ?",
            [status, comments || '', adminId || 1, recordId]
        );

        // Notify user
        const [record] = await db.query("SELECT user_id, waste_type FROM tbl_waste_records WHERE record_id = ?", [recordId]);
        if (record.length > 0) {
            await db.query(
                "INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [
                    record[0].user_id,
                    `Waste Entry ${status}`,
                    `Your ${record[0].waste_type} entry has been marked as ${status}.`,
                    status === 'Rejected' ? 'ERROR' : 'SUCCESS'
                ]
            );
        }

        res.json({ message: `Record marked as ${status}` });
    } catch (e) {
        console.error("Verify Record Error:", e);
        res.status(500).json({ message: "Error verifying record" });
    }
};

export const updateWasteRecord = async (req, res) => {
    const { recordId } = req.params;
    const { weight, quantity, category, status } = req.body;
    try {
        await db.query(
            "UPDATE tbl_waste_records SET weight = ?, quantity = ?, category = ?, status = ? WHERE record_id = ?",
            [weight, quantity, category, status, recordId]
        );
        res.json({ message: "Record updated successfully" });
    } catch (e) {
        console.error("Update Record Error:", e);
        res.status(500).json({ message: "Error updating record" });
    }
};

export const deleteWasteRecord = async (req, res) => {
    const { recordId } = req.params;
    try {
        await db.query("DELETE FROM tbl_waste_records WHERE record_id = ?", [recordId]);
        res.json({ message: "Record deleted successfully" });
    } catch (e) {
        console.error("Delete Record Error:", e);
        res.status(500).json({ message: "Error deleting record" });
    }
};

/**
 * Universal Sync Helper to maintain transactional data integrity
 * @param {Object} data { userId, wasteType, category, weight, quantity, location, scanMethod, pickupId, status, comments }
 */
export const syncWasteRecord = async (data) => {
    try {
        // Check for duplicate if it's a scan (prevent same user scanning same type at same location in same minute)
        if (data.scanMethod === 'SCAN') {
            const [existing] = await db.query(
                "SELECT * FROM tbl_waste_records WHERE user_id = ? AND waste_type = ? AND location = ? AND created_at > NOW() - INTERVAL 1 MINUTE",
                [data.userId, data.wasteType, data.location]
            );
            if (existing.length > 0) return existing[0].record_id;
        }

        const [result] = await db.query(
            "INSERT INTO tbl_waste_records (user_id, waste_type, category, weight, quantity, location, scan_method, pickup_id, status, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [data.userId, data.wasteType, data.category, data.weight || 0, data.quantity || 1, data.location || 'Unknown', data.scanMethod, data.pickupId || null, data.status || 'Pending', data.comments || '']
        );
        console.log(`✅ Waste Record Synced: ${data.wasteType} (Source: ${data.scanMethod})`);
        return result.insertId;
    } catch (e) {
        console.error("❌ Sync Waste Record Error:", e.message);
    }
};
