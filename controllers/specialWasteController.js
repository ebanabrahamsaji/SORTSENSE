
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
export const createRequest = async (req, res) => {
    const { userId, category, quantity, description, preferredDate, location } = req.body;
    const imageFile = req.file;

    if (!userId || !category || !quantity || !preferredDate || !location) {
        return res.status(400).json({ message: 'All fields are required.' });
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
            SELECT r.*, u.name as user_name, u.email 
            FROM tbl_special_waste_requests r 
            JOIN tbl_users u ON r.user_id = u.user_id 
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests.' });
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

        if (status === 'Approved' && centerId) {
            updateQuery += ', center_id = ?';
            params.push(centerId);
        }

        updateQuery += ' WHERE request_id = ?';
        params.push(requestId);

        await db.query(updateQuery, params);

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
                    // Assuming tbl_notifications exists
                    await db.query('INSERT INTO tbl_notifications (user_id, title, message) VALUES (?, ?, ?)',
                        [reqData.user_id, title, message]);
                } catch (e) {
                    // Ignore notif table errors if any
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
    const { centerId } = req.query;
    if (!centerId) return res.status(400).json({ message: "Center ID required" });

    try {
        // Only show Approved, Scheduled, Completed. No Pending (Admin review) or Rejected (Dead).
        const [rows] = await db.query(`
            SELECT r.*, u.name as user_name, u.email, u.phone 
            FROM tbl_special_waste_requests r 
            JOIN tbl_users u ON r.user_id = u.user_id 
            WHERE r.center_id = ? AND r.status IN ('Approved', 'Scheduled', 'Completed')
            ORDER BY r.created_at DESC
        `, [centerId]);
        res.json(rows);
    } catch (error) {
        console.error("Get Center Requests Error:", error);
        res.status(500).json({ message: 'Error fetching requests.' });
    }
};

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
