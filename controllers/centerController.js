import db from '../db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { transporter } from '../email.js';

// Get Nearby Collection Centers
// Uses Haversine formula in SQL for accurate distance calculation
export const getCollectionCenters = async (req, res) => {
    const { category, lat, lng } = req.query;

    try {
        let query = "";
        let params = [];
        let whereClauses = [];

        // Base Query Selection
        let selectClause = "SELECT cc.*";

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

        query = `${selectClause} FROM tbl_collection_centers cc`;

        // Category Filtering
        // We join with the accepted categories table if a category is specified
        if (category && category !== 'all' && category !== 'undefined') {
            query = `${selectClause} FROM tbl_collection_centers cc`; // Reset base without WHERE yet

            // LEFT JOIN to allow filtering by category but also keeping center info for check
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
        query = query.replace('SELECT cc.*', 'SELECT DISTINCT cc.*');

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
        const [rows] = await db.query("SELECT * FROM tbl_collection_centers WHERE center_id = ?", [id]);
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
            "SELECT * FROM tbl_center_notifications WHERE center_id = ? ORDER BY created_at DESC LIMIT 50",
            [centerId]
        );
        const [unread] = await db.query(
            "SELECT COUNT(*) as c FROM tbl_center_notifications WHERE center_id = ? AND is_read = 0",
            [centerId]
        );
        res.json({ success: true, notifications: rows, unreadCount: unread[0].c });
    } catch (error) {
        console.error("Get Center Notifications Error:", error);
        res.status(500).json({ success: false, message: "Error fetching notifications" });
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
        const [existing] = await db.query(
            "SELECT * FROM tbl_collection_centers WHERE username = ? OR email = ?",
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: "Center already registered with this username or email." });
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
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const center = rows[0];
        const isMatch = await bcrypt.compare(password, center.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Update center status to 'online' on successful login
        await db.query(
            "UPDATE tbl_collection_centers SET center_status = 'online', last_active_at = NOW(), offline_since = NULL WHERE center_id = ?",
            [center.center_id]
        );

        // Create a mock token for session handling (consistent with frontend requirements)
        const token = crypto.randomBytes(32).toString('hex');

        // Omit password hash for safety
        const { password_hash, ...centerInfo } = center;

        res.json({
            message: 'Login successful.',
            token,
            center: {
                ...centerInfo,
                id: center.center_id // Helper for frontend mapping
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
