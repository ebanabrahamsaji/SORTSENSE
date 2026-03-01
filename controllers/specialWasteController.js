
import db from '../db.js';
import { transporter } from '../email.js';

// Configuration for Waste Types (Updated Units)
const WASTE_RULES = {
    'E-waste': { min: 1, max: 1000, unit: 'items', hazardous: false },
    'Biomedical': { min: 0.1, max: 50, unit: 'kg', hazardous: true, restricted: true },
    'Hazardous': { min: 0.1, max: 50, unit: 'kg', hazardous: true, restricted: true },
    'Festival': { min: 5, max: 2000, unit: 'kg', hazardous: false },
    'Bulk': { min: 10, max: 5000, unit: 'kg', hazardous: false },
    'Medicines': { min: 0.01, max: 20, unit: 'kg', hazardous: true },
    'Construction Debris': { min: 0.5, max: 500, unit: 'tons', hazardous: false }
};

// Create Request
import moderationService from '../services/moderationService.js';

// Create Request
export const createRequest = async (req, res) => {
    console.log("Create Request Body:", req.body); // Debug log
    const { userId, category, quantity, description, preferredDate, location } = req.body;
    const imageFile = req.file;

    if (!userId || !category || !quantity || !preferredDate || !location || !description) {
        const missing = [];
        if (!userId) missing.push('userId');
        if (!category) missing.push('category');
        if (!quantity) missing.push('quantity');
        if (!preferredDate) missing.push('preferredDate');
        if (!location) missing.push('location');
        if (!description) missing.push('description');
        return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    // --- DUPLICATE DETECTION ---
    try {
        const [existing] = await db.query(
            "SELECT * FROM tbl_special_waste_requests WHERE user_id = ? AND category = ? AND location = ? AND created_at > NOW() - INTERVAL 30 MINUTE",
            [userId, category, location]
        );
        if (existing.length > 0) {
            console.log(`⚠️ Duplicate special waste request from user ${userId}. Penalizing.`);
            await moderationService.handleContentViolation(userId, 'DUPLICATE_ENTRY', `Repeated ${category} request from same location`);
            return res.status(409).json({ message: "A similar request was recently submitted. This incident has been logged for moderation." });
        }
    } catch (e) { console.error("Duplicate check error:", e); }
    // ---------------------------

    if (description.trim().length < 20) {
        return res.status(400).json({ message: 'Description must be at least 20 characters.' });
    }

    const rule = WASTE_RULES[category];
    if (!rule) return res.status(400).json({ message: 'Invalid waste category.' });

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < rule.min || qty > rule.max) {
        return res.status(400).json({ message: `Quantity must be between ${rule.min} and ${rule.max} ${rule.unit} for ${category}.` });
    }

    const unit = rule.unit;
    const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;

    try {
        const [result] = await db.query(
            'INSERT INTO tbl_special_waste_requests (user_id, category, quantity_value, quantity_unit, description, preferred_date, location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, category, qty, unit, description, preferredDate, location, imageUrl]
        );

        // --- Notifications ---
        try {
            await db.query(
                "INSERT INTO tbl_admin_notifications (type, title, message, reference_id) VALUES (?, ?, ?, ?)",
                ['WASTE', 'New Special Waste Request', `User ${userId} requested ${category} (${qty} ${unit}).`, result.insertId]
            );
        } catch (e) { console.error("Admin Notif Error:", e); }

        res.status(201).json({ message: 'Special waste request submitted successfully.', id: result.insertId });

    } catch (error) {
        console.error("Create Request Error:", error);
        res.status(500).json({ message: 'Database error.' });
    }
};

// Get User Requests
export const getUserRequests = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required.' });

    try {
        const [rows] = await db.query('SELECT * FROM tbl_special_waste_requests WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests.' });
    }
};

// Admin: Get All Requests
export const getAllRequests = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, u.name as user_name, u.email, cc.center_name, r.assignment_status
            FROM tbl_special_waste_requests r 
            JOIN tbl_users u ON r.user_id = u.user_id 
            LEFT JOIN tbl_collection_centers cc ON r.center_id = cc.center_id
            ORDER BY r.created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Fetch All Error:", error);
        res.status(500).json({ success: false, message: 'Error fetching requests.' });
    }
};

// Admin: Update Status / Schedule & Assign Center
export const updateStatus = async (req, res) => {
    const { requestId, status, adminNotes, centerId } = req.body;

    if (!['Pending', 'Approved', 'Scheduled', 'Completed', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        let updateQuery = 'UPDATE tbl_special_waste_requests SET status = ?, admin_notes = ?';
        const params = [status, adminNotes || ''];

        // If a center is selected, update center_id and set assignment_status to 'assigned'
        if (centerId) {
            updateQuery += ', center_id = ?, assignment_status = "assigned"';
            params.push(centerId);
        } else if (status === 'Approved') {
            // Requirement 1: If Approved, we must have an assignment_status. 
            // If No centerId provided yet, mark as unassigned but set status correctly.
            updateQuery += ', assignment_status = "unassigned"';
        }

        updateQuery += ' WHERE request_id = ?';
        params.push(requestId);

        const [result] = await db.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        // Fetch Request Details for Notifications
        const [rows] = await db.query('SELECT r.*, u.email, u.name, u.user_id FROM tbl_special_waste_requests r JOIN tbl_users u ON r.user_id = u.user_id WHERE r.request_id = ?', [requestId]);

        if (rows.length > 0) {
            const reqData = rows[0];

            // Notifications
            if (['Approved', 'Rejected', 'Scheduled', 'Completed'].includes(status)) {
                sendNotification(reqData.email, reqData.name, status, reqData.category, adminNotes);

                try {
                    const title = `Special Waste ${status}`;
                    const message = `Your request for ${reqData.category} has been ${status}. ${adminNotes ? 'Note: ' + adminNotes : ''}`;
                    await db.query('INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                        [reqData.user_id, title, message, status === 'Rejected' ? 'ALERT' : 'PICKUP']);

                    // Notify Center if assigned
                    const targetCenter = centerId || reqData.center_id;
                    if (targetCenter) {
                        await db.query(
                            "INSERT INTO tbl_center_notifications (center_id, type, title, message) VALUES (?, ?, ?, ?)",
                            [targetCenter, 'PICKUP', 'Special Waste Assigned', `A ${reqData.category} request (#${requestId}) has been ${status} and assigned to you.`]
                        );
                    }
                } catch (e) {
                    console.error("Notif Error:", e);
                }
            }
        }

        res.json({ message: `Request updated to ${status}` });

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: 'Error updating status.' });
    }
};

// Get Center Requests (Assigned Only)
export const getCenterRequests = async (req, res) => {
    // 🛡️ SECURITY FIX: Use id from authenticated token, NOT query parameter
    const centerId = req.user ? req.user.id : null;

    if (!centerId) {
        console.warn('[getCenterRequests] Unauthorized access attempt or missing center ID in token');
        return res.status(401).json({ message: 'Authentication required.' });
    }

    // 🔍 DEBUG — verify session center_id
    console.log(`[getCenterRequests] Fetching Approved Special Waste for centerId (from token): ${centerId}`);

    try {
        // 🎯 FIX: Fetch ONLY Approved requests for this center (Requirement 2)
        // 🎯 FIX: Include Role-Based Visibility / Assignment Meta (Requirement 3)
        // We join with tbl_collection_centers to identify if this is a Primary or Secondary assignment
        const [rows] = await db.query(`
            SELECT
                r.request_id,
                r.category       AS waste_type,
                r.quantity_value AS quantity,
                r.quantity_unit  AS unit,
                r.location,
                r.status,
                r.created_at     AS assigned_date,
                r.admin_notes,
                r.description,
                r.preferred_date,
                u.name           AS user_name,
                u.email,
                u.phone,
                cc.is_primary    AS assigned_type_is_primary,
                CASE WHEN cc.is_primary = 1 THEN 'Primary' ELSE 'Secondary' END AS assigned_type
            FROM tbl_special_waste_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            JOIN tbl_collection_centers cc ON r.center_id = cc.center_id
            WHERE r.center_id = ?
              AND r.status = 'Approved'
            ORDER BY r.created_at DESC
        `, [centerId]);

        console.log(`[getCenterRequests] Success: Found ${rows?.length || 0} approved requests for center ${centerId}`);
        res.json(Array.isArray(rows) ? rows : []);

    } catch (error) {
        console.error('Get Center Special Waste Error:', error);
        res.status(500).json({ message: 'Error fetching center requests.', error: error.message });
    }
}

// Helper: Notification
async function sendNotification(email, name, status, category, notes) {
    const subject = `SortSense - Special Waste Request ${status}`;
    let text = `Hello ${name},\n\nYour special waste request for ${category} has been ${status}.`;

    if (status === 'Scheduled') text += `\n\nIt has been scheduled for pickup.`;
    if (notes) text += `\n\nAdmin Notes: ${notes}`;

    try {
        await transporter.sendMail({
            from: `"SortSense Support" <${process.env.EMAIL_USER}>`,
            to: email, subject: subject, text: text
        });
    } catch (error) { console.error("Email Failed:", error); }
}

// Update Request Details (Admin Edit)
export const updateRequestDetails = async (req, res) => {
    const { requestId, category, quantity, description, preferredDate, location } = req.body;

    if (!requestId || !category || !quantity || !preferredDate || !location) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check current status
        const [rows] = await db.query('SELECT status FROM tbl_special_waste_requests WHERE request_id = ?', [requestId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Request not found.' });

        if (rows[0].status !== 'Pending') {
            return res.status(403).json({ message: 'Only Pending requests can be edited.' });
        }

        // Validate Category & Quantity
        const rule = WASTE_RULES[category];
        if (!rule) return res.status(400).json({ message: 'Invalid waste category.' });

        const qty = parseFloat(quantity);
        // Note: Client might send quantity as string, parseFloat handles it.
        // Validate min/max
        if (isNaN(qty) || qty < rule.min || qty > rule.max) {
            return res.status(400).json({ message: `Quantity must be between ${rule.min} and ${rule.max} ${rule.unit} for ${category}.` });
        }

        const unit = rule.unit;

        // Update
        await db.query(
            'UPDATE tbl_special_waste_requests SET category = ?, quantity_value = ?, quantity_unit = ?, description = ?, preferred_date = ?, location = ? WHERE request_id = ?',
            [category, qty, unit, description, preferredDate, location, requestId]
        );

        res.json({ message: 'Request details updated successfully.' });

    } catch (error) {
        console.error("Update Details Error:", error);
        res.status(500).json({ message: 'Database error.' });
    }
};

// Delete Request (Admin)
export const deleteRequest = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Request ID missing.' });

    try {
        // Optional: Check status before delete?
        // Admin can delete any, usually Rejected ones.

        const [result] = await db.query('DELETE FROM tbl_special_waste_requests WHERE request_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        res.json({ message: 'Request deleted successfully.' });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: 'Database error.' });
    }
};
