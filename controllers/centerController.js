import db from '../db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { transporter } from '../email.js';
import jwt from 'jsonwebtoken';

const rawSecret = process.env.JWT_SECRET || 'fallback_secret';
const JWT_SECRET = rawSecret.trim().replace(/^"|"$/g, '');

// Get Nearby Collection Centers
// Uses Haversine formula in SQL for accurate distance calculation
export const getCollectionCenters = async (req, res) => {
    const { category, lat, lng } = req.query;

    try {
        // If center inactive for more than 5 minutes, set is_online = 0
        await db.query(`
            UPDATE tbl_collection_centers 
            SET is_online = 0, center_status = 'CLOSED', offline_since = NOW()
            WHERE is_online = 1 AND (last_seen < NOW() - INTERVAL 5 MINUTE OR last_seen IS NULL)
        `).catch(e => console.error("Auto-offline update error:", e));

        let params = [];
        let whereClauses = [];

        // Base Query Selection
        let selectClause = `
            SELECT cc.*,
            CASE
                WHEN cc.is_online = 0 THEN 'CLOSED'
                WHEN cc.last_seen IS NULL THEN 'CLOSED'
                WHEN TIMESTAMPDIFF(SECOND, cc.last_seen, NOW()) <= 60 THEN 'OPEN'
                WHEN TIMESTAMPDIFF(SECOND, cc.last_seen, NOW()) <= 300 THEN 'IDLE'
                ELSE 'CLOSED'
            END AS live_status
        `;

        // Haversine Distance Calculation (if lat/lng provided)
        if (lat && lng) {
            selectClause += `, (6371 * acos(
                cos(radians(?)) * cos(radians(cc.latitude)) * 
                cos(radians(cc.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(cc.latitude))
            )) AS distance`;
            params.push(lat, lng, lat);
        } else {
            selectClause += ", NULL as distance";
        }

        let query = `${selectClause} FROM tbl_collection_centers cc`;

        // Category Filtering
        if (category && category !== 'all' && category !== 'undefined') {
            query += ` 
            LEFT JOIN tbl_accepted_categories ac ON cc.center_id = ac.center_id
            LEFT JOIN tbl_categories cat ON ac.category_id = cat.category_id`;

            // Flexible matching: Category matches OR Type matches Keyword OR Type is HKS
            whereClauses.push("(cat.category_name LIKE ? OR cc.type LIKE ? OR cc.type LIKE '%HKS%' OR cc.type LIKE '%Harita%')");
            params.push(`%${category}%`, `%${category}%`);
        }

        // Apply Where Clauses
        if (whereClauses.length > 0) {
            query += " WHERE " + whereClauses.join(" AND ");
        }

        // Add DISTINCT to main select to avoid duplicates from joins
        if (query.includes('SELECT cc.*')) {
            query = query.replace('SELECT cc.*', 'SELECT DISTINCT cc.*');
        } else {
            // Fallback for the multi-line version
            query = query.replace(/SELECT\s+cc\.\*/i, 'SELECT DISTINCT cc.*');
        }

        // Sorting
        // Primary centers first, then Distance or Name
        if (lat && lng) {
            query += " ORDER BY cc.is_primary DESC, distance ASC";
        } else {
            query += " ORDER BY cc.is_primary DESC, cc.center_name ASC";
        }

        // Limit Results (optional, but good for performance)
        query += " LIMIT 50";

        // console.log(`[CenterController] Query params: ${params}`);

        const [centers] = await db.query(query, params);

        // Format for Frontend
        const formattedCenters = centers.map(c => ({
            ...c,
            distance: c.distance !== null ? parseFloat(c.distance).toFixed(2) : null,
            // Ensure numeric for map plotting
            latitude: parseFloat(c.latitude),
            longitude: parseFloat(c.longitude),
            // Availability & Real-time Status Logic
            status: c.status || 'OPEN',
            center_status: c.center_status || 'offline',
            performance_score: c.center_performance_score || 100,
            available_slots: c.available_slots !== undefined ? c.available_slots : 10,
            max_slots: c.max_slots !== undefined ? c.max_slots : 10,
            busyLevel: (c.available_slots === 0 || c.status === 'CLOSED') ? 'Full'
                : (c.available_slots < (c.max_slots || 10) / 2) ? 'Busy' : 'Free'
        }));

        res.json(formattedCenters);

    } catch (error) {
        console.error("Error fetching centers:", error);
        res.status(500).json({ message: 'Error fetching collection centers.' });
    }
};

// Get Center Profile by ID
export const getCenterById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT *,
            CASE
                WHEN is_online = 0 THEN 'CLOSED'
                WHEN TIMESTAMPDIFF(SECOND, last_seen, NOW()) <= 60 THEN 'OPEN'
                WHEN TIMESTAMPDIFF(SECOND, last_seen, NOW()) <= 300 THEN 'IDLE'
                ELSE 'CLOSED'
            END AS live_status
            FROM tbl_collection_centers 
            WHERE center_id = ?
        `, [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Center not found" });

        const center = rows[0];

        let busyLevel = 'Free';
        if (center.available_slots === 0) busyLevel = 'Full';
        else if (center.available_slots < (center.max_slots || 10) / 2) busyLevel = 'Busy';

        res.json({ ...center, busyLevel });
    } catch (error) {
        console.error("Get Center Error:", error);
        res.status(500).json({ message: "Error fetching center profile" });
    }
};

// Add Center (Admin)
export const addCenter = async (req, res) => {
    // Expect clean JSON from frontend
    const { name, address, max_slots } = req.body;

    // Validate
    if (!name || !address) {
        return res.status(400).json({ message: "Name and Address are required" });
    }

    // Default values for fields not provided
    const status = 'OPEN';
    const slots = max_slots || 10;
    const lat = 0.0; // Default until geo-coded
    const lng = 0.0;

    try {
        await db.query(`
            INSERT INTO tbl_collection_centers 
            (center_name, address, status, max_slots, available_slots, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, address, status, slots, slots, lat, lng]);

        res.json({ success: true, message: 'Center added successfully' });
    } catch (error) {
        console.error("Add Center Error:", error.message);
        res.status(500).json({ message: `Error adding center: ${error.message}` });
    }
};

// Delete Center (Admin)
export const deleteCenter = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query("DELETE FROM tbl_collection_centers WHERE center_id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Center not found" });

        res.json({ success: true, message: 'Center deleted successfully' });
    } catch (error) {
        console.error("Delete Center Error:", error);
        res.status(500).json({ message: 'Error deleting center' });
    }
};

// Set Primary Center (Admin)
export const setPrimaryCenter = async (req, res) => {
    const { id } = req.params;
    try {
        // Reset all first
        await db.query("UPDATE tbl_collection_centers SET is_primary = FALSE");

        // precise target update
        const [result] = await db.query("UPDATE tbl_collection_centers SET is_primary = TRUE WHERE center_id = ?", [id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Center not found" });

        res.json({ success: true, message: 'Primary center updated' });
    } catch (error) {
        console.error("Set Primary Error:", error);
        res.status(500).json({ message: 'Error setting primary center' });
    }
};

// Add Center User Account (Admin/Center)
// Creates a new user account with role 'CENTER' and links it to an existing collection center
export const addCenterUser = async (req, res) => {
    try {
        const { name, email, password, centerId } = req.body;

        // Validation
        if (!name || !email || !password || !centerId) {
            return res.status(400).json({ message: "Name, Email, Password, and Center ID are required." });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check if center exists
        const [centerCheck] = await db.query("SELECT * FROM tbl_collection_centers WHERE center_id = ?", [centerId]);
        if (centerCheck.length === 0) {
            return res.status(404).json({ message: "Collection center not found." });
        }

        // Check for duplicate email
        const [existing] = await db.query("SELECT * FROM tbl_users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "User with this email already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with CENTER role
        const [result] = await db.query(
            `INSERT INTO tbl_users (name, email, password_hash, role, status, center_id, created_at) 
             VALUES (?, ?, ?, 'CENTER', 'Active', ?, NOW())`,
            [name, email, hashedPassword, centerId]
        );

        const centerName = centerCheck[0].center_name;

        // Send welcome email
        try {
            await transporter.sendMail({
                from: `"SortSense Support" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Welcome to SortSense - Center Account Created',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #10B981;">Welcome to SortSense!</h2>
                        <p>Hi ${name},</p>
                        <p>A collection center account has been created for you.</p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Role:</strong> Collection Center Manager</p>
                            <p><strong>Assigned Center:</strong> ${centerName}</p>
                        </div>
                        <p>You can now log in to manage pickup requests and center operations.</p>
                        <a href="http://localhost:8000/pages/login-user.html" 
                           style="background:#10b981; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; display:inline-block; margin-top:20px;">
                            Login to Dashboard
                        </a>
                        <br><br>
                        <p>Best regards,</p>
                        <p><strong>SortSense Team</strong></p>
                    </div>
                `
            });
            console.log(`✅ Welcome email sent to ${email}`);
        } catch (emailErr) {
            console.error("❌ Failed to send welcome email:", emailErr);
        }

        res.status(201).json({
            success: true,
            message: 'Center user created successfully',
            userId: result.insertId,
            centerName: centerName
        });

    } catch (error) {
        console.error("Add Center User Error:", error);
        res.status(500).json({ message: 'Error creating center user: ' + error.message });
    }
};

// --- Center Notifications ---
export const getCenterNotifications = async (req, res) => {
    const { id: centerId } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT id, type, title, message, is_read, created_at
             FROM tbl_center_notifications
             WHERE center_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [centerId]
        );
        const [unread] = await db.query(
            "SELECT COUNT(*) as c FROM tbl_center_notifications WHERE center_id = ? AND is_read = 0",
            [centerId]
        );
        // Always return a stable structure — never 500
        res.json({
            success: true,
            notifications: Array.isArray(rows) ? rows : [],
            unreadCount: unread[0]?.c ?? 0
        });
    } catch (error) {
        console.error("Get Center Notifications Error:", error);
        // Return empty — never break the bell
        res.json({ success: true, notifications: [], unreadCount: 0 });
    }
};

export const markCenterNotificationRead = async (req, res) => {
    const { id: centerId } = req.params;
    const { notificationId } = req.body;
    try {
        if (notificationId === 'all') {
            await db.query("UPDATE tbl_center_notifications SET is_read = 1 WHERE center_id = ? AND is_read = 0", [centerId]);
        } else {
            await db.query("UPDATE tbl_center_notifications SET is_read = 1 WHERE id = ? AND center_id = ?", [notificationId, centerId]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating notification" });
    }
};

export const clearCenterNotifications = async (req, res) => {
    const { id: centerId } = req.params;
    try {
        await db.query("DELETE FROM tbl_center_notifications WHERE center_id = ?", [centerId]);
        res.json({ success: true, message: "Notifications cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error clearing notifications" });
    }
};

// --- Center Auth (Login/Register) ---

// Register Center
export const registerCenter = async (req, res) => {
    const { name, username, email, phone, address, password } = req.body;

    // Validation
    if (!name || !username || !email || !phone || !address || !password) {
        return res.status(400).json({ message: "All fields are required. Please fill in all information." });
    }

    try {
        // Check uniqueness for username and email in tbl_collection_centers
        const [existingUser] = await db.query("SELECT * FROM tbl_collection_centers WHERE username = ?", [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ success: false, message: "Username already registered. Please login or choose another." });
        }

        const [existingEmail] = await db.query("SELECT * FROM tbl_collection_centers WHERE email = ?", [email]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ success: false, message: "Email already registered. Please login or use 'forgot password'." });
        }

        // Hash password securely
        const password_hash = await bcrypt.hash(password, 10);

        // Insert into tbl_collection_centers
        // Default values for operational fields
        await db.query(`
            INSERT INTO tbl_collection_centers 
            (center_name, username, password_hash, email, phone, address, status, center_status, latitude, longitude, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'OPEN', 'offline', 0, 0, NOW())
        `, [name, username, password_hash, email, phone, address]);

        res.status(201).json({
            success: true,
            message: "Registration Successful — Please Login",
            autoFillUsername: username
        });

    } catch (error) {
        console.error("Register Center Error:", error);
        res.status(500).json({ message: "Registration failed: " + error.message });
    }
};

// Center Login
export const centerLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Login by username or email
        const [rows] = await db.query(
            "SELECT * FROM tbl_collection_centers WHERE username = ? OR email = ?",
            [username, username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "No center account found with that username/email." });
        }

        const center = rows[0];
        const isMatch = await bcrypt.compare(password, center.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password. Please try again." });
        }

        // Update center status for live tracking (Requirement: is_online=1, last_seen=NOW())
        await db.query(`
            UPDATE tbl_collection_centers 
            SET is_online = 1, 
                last_seen = NOW(),
                last_active_time = NOW(),
                center_status = 'online',
                offline_since = NULL
            WHERE center_id = ?
        `, [center.center_id]).catch(err => console.error("Center login status update error:", err));

        // Create a proper JWT Token (replacing mock hex token)
        const token = jwt.sign(
            {
                id: center.center_id,
                role: 'CENTER',
                email: center.email || center.username,
                name: center.center_name || center.username
            },
            JWT_SECRET,
            { expiresIn: '168h' } // Increased to 7 days for stable dashboard monitoring
        );

        // Omit password hash for safety
        const { password_hash, ...centerInfo } = center;

        res.json({
            message: 'Login successful.',
            token,
            center: {
                ...centerInfo,
                id: center.center_id,
                center_id: center.center_id // Explicitly both
            }
        });

    } catch (error) {
        console.error("Center Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};

// Helper (Internal)
export const createCenterNotification = async (centerId, type, title, message) => {
    try {
        await db.query(
            "INSERT INTO tbl_center_notifications (center_id, type, title, message) VALUES (?, ?, ?, ?)",
            [centerId, type, title, message]
        );
    } catch (e) {
        console.error("Create Center Notification Error:", e);
    }
};

// Center Heartbeat (Item 2)
export const centerHeartbeat = async (req, res) => {
    const { centerId } = req.body;
    if (!centerId) return res.status(400).json({ message: "Center ID required" });

    try {
        await db.query(
            "UPDATE tbl_collection_centers SET last_seen = NOW(), last_active_time = NOW(), is_online = 1, center_status = 'online' WHERE center_id = ?",
            [centerId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error("Heartbeat Error:", error);
        res.status(500).json({ message: "Heartbeat failed" });
    }
};

// Center Logout (Item 4)
export const centerLogout = async (req, res) => {
    const { centerId } = req.body;
    if (!centerId) return res.status(400).json({ message: "Center ID required" });

    try {
        await db.query(
            "UPDATE tbl_collection_centers SET is_online = 0 WHERE center_id = ?",
            [centerId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Logout status update failed" });
    }
};
