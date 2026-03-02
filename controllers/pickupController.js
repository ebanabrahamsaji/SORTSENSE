import db from '../db.js';
import { syncWasteRecord } from './adminController.js';

// 1. Create Pickup Request (Finds Nearest Center)
export const createPickupRequest = async (req, res) => {
    let { userId, wasteType, quantity, lat, lng, address } = req.body;

    if (!userId || !wasteType || !quantity) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    try {
        // Fallback Logic if Location is Missing
        if (!lat || !lng) {
            console.log(`⚠️ No location provided for User ${userId}. Attempting fallback...`);

            // Try last known location from waste records
            const [history] = await db.query(
                "SELECT location FROM tbl_waste_records WHERE user_id = ? AND location IS NOT NULL AND location != 'Unknown' ORDER BY created_at DESC LIMIT 1",
                [userId]
            );

            if (history.length > 0 && history[0].location.includes(',')) {
                const parts = history[0].location.split(',');
                if (parts.length === 2) {
                    lat = parseFloat(parts[0].trim());
                    lng = parseFloat(parts[1].trim());
                    console.log(`✅ Used Last Known Location: ${lat}, ${lng}`);
                }
            }
        }

        // If still no location, default to a central point (e.g., Kerala center or specific Default) 
        // OR Select Center with ID 1 (Default) if explicit routing fails.
        // For robustness, let's assume if we can't find a location, we pick the first available center.

        let nearestCenter = null;
        let primaryType = wasteType.split(',')[0].trim(); // Handle "Plastic, Paper"

        // A. Find Nearest Center (Filtered by Waste Type)
        // Kochi Coords as default for distance calculation if user location is missing
        const defaultLat = 9.9312;
        const defaultLng = 76.2673;

        const findCenterQuery = `
            SELECT DISTINCT cc.center_id, cc.center_name, 
            (6371 * acos(
                cos(radians(?)) * cos(radians(cc.latitude)) * 
                cos(radians(cc.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(cc.latitude))
            )) AS distance
            FROM tbl_collection_centers cc
            LEFT JOIN tbl_accepted_categories ac ON cc.center_id = ac.center_id
            LEFT JOIN tbl_categories cat ON ac.category_id = cat.category_id
            WHERE (cat.category_name LIKE ? OR cc.type LIKE ? OR cc.type LIKE '%HKS%' OR cc.type LIKE '%Haritha%')
            AND cc.status = 'OPEN' AND cc.available_slots > 0
            ORDER BY distance ASC
            LIMIT 1
        `;

        const searchType = `%${primaryType}%`;
        const [centers] = await db.query(findCenterQuery, [lat || defaultLat, lng || defaultLng, lat || defaultLat, searchType, searchType]);

        if (centers.length > 0) {
            nearestCenter = centers[0];
        } else {
            // Fallback: If no specific center found, try finding ANY nearest center (General HKS)
            const fallbackQuery = `
                SELECT center_id, center_name, 
                (6371 * acos(
                    cos(radians(?)) * cos(radians(latitude)) * 
                    cos(radians(longitude) - radians(?)) + 
                    sin(radians(?)) * sin(radians(latitude))
                )) AS distance
                FROM tbl_collection_centers
                WHERE status = 'OPEN' AND available_slots > 0
                ORDER BY distance ASC LIMIT 1
            `;
            const [fallbackCenters] = await db.query(fallbackQuery, [lat || defaultLat, lng || defaultLng, lat || defaultLat]);
            if (fallbackCenters.length > 0) nearestCenter = fallbackCenters[0];
        }



        if (!nearestCenter) {
            return res.status(404).json({ message: "No collection centers available." });
        }

        // --- Availability Check ---
        // Need to fetch fresh status and slots for the chosen center to be sure
        const [centerStatusArr] = await db.query("SELECT status, available_slots FROM tbl_collection_centers WHERE center_id = ?", [nearestCenter.center_id]);

        if (centerStatusArr.length > 0) {
            const cStatus = centerStatusArr[0];
            // console.log(`[Pickup] Center ${nearestCenter.center_id} Status:`, cStatus); // Debug

            if (cStatus.status === 'CLOSED' || cStatus.available_slots <= 0) {
                return res.status(409).json({ // 409 Conflict
                    message: "Selected center is currently full or closed. Please try again later or choose another location.",
                    centerName: nearestCenter.center_name
                });
            }

            // Decrement Slot - Fix Logic: Use updated value for check
            // If available_slots becomes 0, status -> CLOSED
            await db.query(`
                UPDATE tbl_collection_centers 
                SET available_slots = available_slots - 1,
                    status = CASE WHEN available_slots = 0 THEN 'CLOSED' ELSE status END
                WHERE center_id = ? AND available_slots > 0
            `, [nearestCenter.center_id]);
        }
        // --------------------------
        // --------------------------


        // Priority & Threshold Logic
        const MIN_THRESHOLD = 5; // 5kg for Normal
        const isOrganic = wasteType.toLowerCase().includes('organic');
        let priority = 'Normal';
        let status = 'Pending';

        // 1. Organic = High Priority (Automatic)
        if (isOrganic) {
            priority = 'High';
            if (quantity < 1) {
                return res.status(400).json({ message: "High Priority (Organic) requires minimum 1kg." });
            }
        }
        // 2. Non-Organic
        else {
            if (quantity < MIN_THRESHOLD) {
                priority = 'Held';
            }
        }

        // B. Insert Request
        const insertQuery = `
            INSERT INTO tbl_pickup_requests (user_id, center_id, waste_type, quantity, status, latitude, longitude, address, assigned_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await db.query(insertQuery, [userId, nearestCenter.center_id, wasteType, quantity, status, lat, lng, address || null]);
        const requestId = result.insertId;

        // --- Challenge: Pickup ---
        import('./leaderboardController.js').then(({ updateChallengeProgress }) => {
            updateChallengeProgress(userId, 'pickup');
        }).catch(e => console.error("Challenge Trigger Error:", e));

        // C. Insert Items
        const types = wasteType.split(',');
        const splitQty = (quantity / types.length).toFixed(2);

        const itemQueries = types.map(type => {
            return db.query(
                "INSERT INTO tbl_pickup_items (request_id, waste_type, quantity) VALUES (?, ?, ?)",
                [requestId, type.trim(), splitQty]
            );
        });

        await Promise.all(itemQueries);

        // --- Transactional Sync ---
        syncWasteRecord({
            userId: userId,
            wasteType: wasteType,
            category: 'Pick-up',
            weight: quantity,
            quantity: types.length,
            location: `${lat}, ${lng}`,
            scanMethod: 'PICKUP',
            pickupId: requestId,
            status: 'Pending'
        });

        // --- Notifications ---
        try {
            // 1. Notify Admin
            await db.query(
                "INSERT INTO tbl_admin_notifications (type, title, message, reference_id) VALUES (?, ?, ?, ?)",
                ['WASTE', 'New Pickup Request', `User ${userId} requested a pickup for ${wasteType} (${quantity}kg).`, requestId]
            );

            // 2. Notify Center
            await db.query(
                "INSERT INTO tbl_center_notifications (center_id, type, title, message) VALUES (?, ?, ?, ?)",
                [nearestCenter.center_id, 'PICKUP', 'New Pickup assigned', `New request #${requestId} for ${wasteType} assigned to your center.`]
            );
        } catch (e) { console.error("Notif Error:", e); }

        res.status(201).json({
            message: priority === 'Held'
                ? "Request Received. Quantity below 5kg; will be aggregated."
                : "Pickup request created successfully.",
            requestId: requestId,
            assignedCenter: nearestCenter.center_name,
            priority: priority,
            distance: nearestCenter.distance ? parseFloat(nearestCenter.distance).toFixed(2) : "N/A"
        });

    } catch (error) {
        console.error("Create Pickup Error:", error);
        res.status(500).json({
            message: "Database error creating pickup request.",
            error: error.message,
            sqlMessage: error.sqlMessage
        });
    }
};

// 2. Get Requests for User
export const getUserRequests = async (req, res) => {
    const { userId } = req.params;

    try {
        const query = `
            SELECT r.*, c.center_name, c.latitude as center_lat, c.longitude as center_lng
            FROM tbl_pickup_requests r
            LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;

        const [requests] = await db.query(query, [userId]);

        // Fetch items for ALL requests
        for (let request of requests) {
            const [items] = await db.query("SELECT * FROM tbl_pickup_items WHERE request_id = ?", [request.request_id]);
            request.items = items;
        }

        res.json(requests); // Return Array
    } catch (error) {
        console.error("Get User Requests Error:", error);
        res.status(500).json({ message: "Error fetching requests." });
    }
};

// 3. Get Requests for COLLECTION CENTER (Dashboard)
// Location-based filtering: centers only see requests where user.location matches center.location
// Fallback: also matches if the request address contains the center's location keyword
export const getCenterRequests = async (req, res) => {
    const { centerId } = req.query;

    // centerId is required — centers only see their own scoped data
    if (!centerId) {
        return res.json([]); // Safe empty array, not an error page
    }

    try {
        // 1. Look up this center's registered location
        const [centerRows] = await db.query(
            "SELECT location FROM tbl_collection_centers WHERE center_id = ?",
            [centerId]
        );
        const centerLocation = (centerRows[0] && centerRows[0].location) ? centerRows[0].location.trim() : null;

        // If center has no location set, fall back to center_id-only matching
        if (!centerLocation) {
            const fallbackActive = `
                SELECT r.*,
                       u.name  AS user_name,
                       u.email AS user_email,
                       u.phone AS user_phone,
                       u.location AS user_location
                FROM tbl_pickup_requests r
                JOIN tbl_users u ON r.user_id = u.user_id
                WHERE r.center_id = ?
                  AND r.status NOT IN ('Completed', 'Rejected', 'Cancelled')
                ORDER BY r.is_urgent DESC, r.created_at ASC
            `;
            const fallbackHistory = `
                SELECT r.*,
                       u.name  AS user_name,
                       u.email AS user_email,
                       u.phone AS user_phone,
                       u.location AS user_location
                FROM tbl_pickup_requests r
                JOIN tbl_users u ON r.user_id = u.user_id
                WHERE r.center_id = ?
                  AND r.status IN ('Completed', 'Rejected', 'Cancelled')
                ORDER BY r.created_at DESC
                LIMIT 50
            `;
            const [a, h] = await Promise.all([
                db.query(fallbackActive, [centerId]).then(r => r[0]),
                db.query(fallbackHistory, [centerId]).then(r => r[0])
            ]);
            return res.json([...(a || []), ...(h || [])]);
        }

        // 2. Location-based matching:
        //    A) user.location matches center.location (case-insensitive, trimmed)
        //    B) OR request.address contains center.location (for legacy requests where user.location is null)
        //    C) OR request was directly assigned to this center (center_id match)
        const locationPattern = `%${centerLocation}%`;

        const activeQuery = `
            SELECT r.*,
                   u.name  AS user_name,
                   u.email AS user_email,
                   u.phone AS user_phone,
                   u.location AS user_location
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            WHERE (
                LOWER(TRIM(COALESCE(u.location, ''))) = LOWER(?)
                OR LOWER(r.address) LIKE LOWER(?)
                OR r.center_id = ?
            )
              AND r.status NOT IN ('Completed', 'Rejected', 'Cancelled')
            ORDER BY r.is_urgent DESC, r.created_at ASC
        `;

        // 3. History (limited to 50 rows for performance)
        const historyQuery = `
            SELECT r.*,
                   u.name  AS user_name,
                   u.email AS user_email,
                   u.phone AS user_phone,
                   u.location AS user_location
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            WHERE (
                LOWER(TRIM(COALESCE(u.location, ''))) = LOWER(?)
                OR LOWER(r.address) LIKE LOWER(?)
                OR r.center_id = ?
            )
              AND r.status IN ('Completed', 'Rejected', 'Cancelled')
            ORDER BY r.created_at DESC
            LIMIT 50
        `;

        const params = [centerLocation, locationPattern, centerId];

        const [activeReqs, historyReqs] = await Promise.all([
            db.query(activeQuery, params).then(r => r[0]),
            db.query(historyQuery, params).then(r => r[0])
        ]);

        const allRequests = [...(activeReqs || []), ...(historyReqs || [])];
        res.json(allRequests);

    } catch (error) {
        console.error("Get Center Requests Error:", error);
        res.json([]);
    }
};


// getAllPickupRequests is defined and exported at the bottom of this file (Admin/Reports).


// 4. Update Status
export const updatePickupStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status, rejectionReason, estimatedPickupTime } = req.body;

    // STRICT Status Enforcement
    if (!['Pending', 'Approved', 'Collected', 'Completed', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value. Must be Pending, Approved, Collected, Completed, or Rejected." });
    }

    try {
        // 1. Get Current Status
        const [rows] = await db.query("SELECT status FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Request not found." });
        }

        const currentStatus = rows[0].status;

        // 2. Validate Transitions
        if (currentStatus === 'Approved' && status === 'Rejected') {
            return res.status(400).json({ message: "Cannot reject an approved request. Please complete it instead." });
        }
        if (currentStatus === 'Completed' && status === 'Rejected') {
            return res.status(400).json({ message: "Cannot reject a completed request." });
        }
        if (currentStatus === 'Rejected' || currentStatus === 'Cancelled') {
            return res.status(400).json({ message: "Cannot update status of a rejected/cancelled request." });
        }
        if (currentStatus === 'Completed') {
            return res.status(400).json({ message: "Request is already completed." });
        }

        // 3. Update Status (SAFE: Does NOT touch user_id)
        let updateQuery = "UPDATE tbl_pickup_requests SET status = ?";
        const params = [status];

        // --- Tracking Automation (Step 6) ---
        if (status === 'Approved') {
            updateQuery += ", accepted_time = NOW()";
        } else if (status === 'Completed') {
            updateQuery += ", completed_time = NOW()";
        }
        // ------------------------------------

        // 4. Handle Optional Fields
        if (status === 'Rejected' && rejectionReason) {
            updateQuery += ", rejection_reason = ?";
            params.push(rejectionReason);
        }
        if (status === 'Approved' && estimatedPickupTime) {
            updateQuery += ", estimated_pickup_time = ?";
            params.push(estimatedPickupTime);
        }

        updateQuery += " WHERE request_id = ?";
        params.push(requestId);

        await db.query(updateQuery, params);

        // --- Transactional Sync Update ---
        try {
            // Map pickup status to record status lifecycle
            let recordStatus = status;
            if (status === 'Approved') recordStatus = 'Verified';
            else if (status === 'Completed' || status === 'Collected') recordStatus = 'Picked';

            await db.query(
                "UPDATE tbl_waste_records SET status = ?, updated_at = NOW() WHERE pickup_id = ?",
                [recordStatus, requestId]
            );
        } catch (syncErr) {
            console.error("Transactional Sync Fail:", syncErr);
        }

        // --- Notification Logic ---
        // Need user_id to notify
        const [uRows] = await db.query("SELECT user_id, center_id, waste_type FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);
        if (uRows.length > 0) {
            const userId = uRows[0].user_id;
            const centerId = uRows[0].center_id;
            const wasteType = uRows[0].waste_type;

            let notifTitle = "Pickup Update";
            let notifMsg = `Your pickup request #${requestId} status has changed to ${status}.`;
            let notifType = "INFO";

            if (status === 'Approved') {
                notifTitle = "Pickup Approved! ✅";
                notifMsg = `Great news! Your request #${requestId} has been approved.`;
                if (estimatedPickupTime) notifMsg += ` ETA: ${estimatedPickupTime}.`;
                notifType = "SUCCESS";
            } else if (status === 'Collected') {
                notifTitle = "Waste Collected 🚛";
                notifMsg = `Your waste for request #${requestId} has been collected.`;
                notifType = "SUCCESS";
            } else if (status === 'Rejected') {
                notifTitle = "Pickup Rejected ❌";
                notifMsg = `Your request #${requestId} was rejected.`;
                if (rejectionReason) notifMsg += ` Reason: ${rejectionReason}`;
                notifType = "ERROR";
            } else if (status === 'Completed') {
                notifTitle = "Process Completed 🎉";
                notifMsg = `Request #${requestId} has been successfully processed. Thank you for recycling!`;
                notifType = "SUCCESS";
            }

            // User Notif
            await db.query(
                "INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [userId, notifTitle, notifMsg, notifType]
            );

            // Center Notif (Optional: Inform center of their own action or admin action if applicable)
            // If it's Completed, let's log it for center too
            if (status === 'Completed' || status === 'Rejected') {
                await db.query(
                    "INSERT INTO tbl_center_notifications (center_id, type, title, message) VALUES (?, ?, ?, ?)",
                    [centerId, 'PICKUP', `Request ${status}`, `Request #${requestId} for ${wasteType} marked as ${status}.`]
                );
            }
        }
        // --- End Notification Logic ---
        res.json({ message: `Request ${requestId} updated to ${status}` });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: "Error updating status." });
    }
};

// 5. Delete Pickup Request
export const deletePickupRequest = async (req, res) => {
    const { requestId } = req.params;

    try {
        console.log(`🗑️ Attempting to delete request #${requestId}...`);

        // 1. Check if request exists and has valid status
        const [rows] = await db.query("SELECT * FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Request not found." });
        }

        const request = rows[0];

        // STRICT Delete Rule: Only Pending or Rejected requests can be deleted
        const allowedDeleteStatuses = ['pending', 'rejected'];

        if (!allowedDeleteStatuses.includes(request.status.toLowerCase())) {
            return res.status(400).json({
                message: `Cannot delete request in '${request.status}' status. Only Pending or Rejected requests can be deleted.`
            });
        }

        // 2. Manually Delete Items (Safety net)
        await db.query("DELETE FROM tbl_pickup_items WHERE request_id = ?", [requestId]);

        // 3. Delete Request
        const [result] = await db.query("DELETE FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: "Failed to delete request record." });
        }

        res.json({ message: "Pickup request deleted successfully." });
    } catch (error) {
        console.error("❌ Delete Request Error:", error);
        res.status(500).json({ message: "Error deleting request.", sqlMessage: error.message });
    }
};

// 6. Add Item to Existing Request (Or New Split Request)
export const addItemToRequest = async (req, res) => {
    const { requestId } = req.params;
    const { wasteType, quantity } = req.body;

    if (!wasteType || !quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid item details." });
    }

    try {
        // Fetch existing request
        const [rows] = await db.query("SELECT * FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);
        if (rows.length === 0) return res.status(404).json({ message: "Request not found." });

        const request = rows[0];

        if (request.status === 'Approved' || request.status === 'Completed') {
            // Case A: Request is finalized (Approved/Completed). 
            // Create a NEW Separate Request for the new item.

            // 1. Create New Request
            const insertQuery = `
                INSERT INTO tbl_pickup_requests (user_id, center_id, waste_type, quantity, status, latitude, longitude, address)
                VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?)
            `;
            const [result] = await db.query(insertQuery, [request.user_id, request.center_id, wasteType, quantity, request.latitude, request.longitude, request.address]);
            const newRequestId = result.insertId;

            // 2. Insert Item into New Request
            await db.query(
                "INSERT INTO tbl_pickup_items (request_id, waste_type, quantity) VALUES (?, ?, ?)",
                [newRequestId, wasteType, quantity]
            );

            return res.json({
                message: "New separate request created for this item.",
                newRequestId: newRequestId
            });

        } else if (request.status === 'Pending') {
            // Case B: Request is still pending. Add to existing.

            await db.query(
                "INSERT INTO tbl_pickup_items (request_id, waste_type, quantity) VALUES (?, ?, ?)",
                [requestId, wasteType, quantity]
            );

            // Sync Summary
            await db.query(`
                UPDATE tbl_pickup_requests
                SET 
                quantity = (SELECT SUM(quantity) FROM tbl_pickup_items WHERE request_id = ?),
                waste_type = (SELECT GROUP_CONCAT(waste_type SEPARATOR ', ') FROM tbl_pickup_items WHERE request_id = ?)
                WHERE request_id = ?
            `, [requestId, requestId, requestId]);

            return res.json({ message: "Item added to pending request." });
        } else {
            return res.status(400).json({ message: "Invalid request status." });
        }

    } catch (error) {
        console.error("Add Item Error:", error);
        res.status(500).json({ message: "Error adding item." });
    }
};

// 7. Delete Item from Request
export const deleteItemFromRequest = async (req, res) => {
    const { requestId, itemId } = req.params;

    try {
        // 1. Verify Request Status
        const [reqRows] = await db.query("SELECT * FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);
        if (reqRows.length === 0) return res.status(404).json({ message: "Request not found." });

        const request = reqRows[0];
        if (request.status !== 'Pending') {
            return res.status(400).json({ message: "Cannot delete items from non-pending requests." });
        }

        // 2. Delete Item
        const [deleteRes] = await db.query("DELETE FROM tbl_pickup_items WHERE item_id = ? AND request_id = ?", [itemId, requestId]);
        if (deleteRes.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found in this request." });
        }

        // 3. Check Remaining Items
        const [items] = await db.query("SELECT * FROM tbl_pickup_items WHERE request_id = ?", [requestId]);

        if (items.length === 0) {
            // No items left, delete the parent request
            await db.query("DELETE FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);
            return res.json({ message: "Item deleted. Request became empty and was removed." });
        } else {
            // Update Summary
            await db.query(`
                UPDATE tbl_pickup_requests
                SET 
                quantity = (SELECT SUM(quantity) FROM tbl_pickup_items WHERE request_id = ?),
                waste_type = (SELECT GROUP_CONCAT(waste_type SEPARATOR ', ') FROM tbl_pickup_items WHERE request_id = ?)
                WHERE request_id = ?
            `, [requestId, requestId, requestId]);

            return res.json({ message: "Item deleted successfully." });
        }

    } catch (error) {
        console.error("Delete Item Error:", error);
        res.status(500).json({ message: "Error deleting item." });
    }
};

// 8. Clear Center History (Bulk Delete)
export const clearCenterHistory = async (req, res) => {
    // In a real app, get centerId from session/token
    // const { centerId } = req.query; // If using query filters

    try {
        console.log("🧹 Clearing Center History...");

        // 1. Identify IDs to delete (Completed, Rejected, Cancelled)
        // Ensure we only delete finalized statuses
        const findQuery = `
            SELECT request_id FROM tbl_pickup_requests 
            WHERE status IN ('Completed', 'Rejected', 'Cancelled')
        `;
        const [rows] = await db.query(findQuery);

        if (rows.length === 0) {
            return res.json({ message: "No history to clear." });
        }

        const ids = rows.map(r => r.request_id);

        if (ids.length > 0) {
            // 2. Delete Items first (Foreign Key Safety)
            await db.query(`DELETE FROM tbl_pickup_items WHERE request_id IN (?)`, [ids]);

            // 3. Delete Requests
            await db.query(`DELETE FROM tbl_pickup_requests WHERE request_id IN (?)`, [ids]);
        }

        res.json({ message: `Successfully cleared ${ids.length} history records.` });

    } catch (error) {
        console.error("Clear History Error:", error);
        res.status(500).json({ message: "Error clearing history." });
    }
};

// 9. Get Pickup Trend
export const getPickupTrend = async (req, res) => {
    try {
        const [today] = await db.query("SELECT COUNT(*) AS count FROM tbl_pickup_requests WHERE DATE(created_at) = CURDATE()");
        const [yesterday] = await db.query("SELECT COUNT(*) AS count FROM tbl_pickup_requests WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY");
        const [week] = await db.query("SELECT COUNT(*) AS count FROM tbl_pickup_requests WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)");

        res.json({
            today: today[0].count,
            yesterday: yesterday[0].count,
            week: week[0].count
        });
    } catch (error) {
        console.error("Get Pickup Trend Error:", error);
        res.json({ today: 0, yesterday: 0, week: 0 });
    }
};

// 10. Get Center Active Count (lightweight poll for center dashboard)
export const getCenterActiveCount = async (req, res) => {
    const { centerId } = req.query;
    if (!centerId) return res.json({ count: 0, latestId: 0 });
    try {
        // Look up this center's registered location
        const [centerRows] = await db.query(
            "SELECT location FROM tbl_collection_centers WHERE center_id = ?",
            [centerId]
        );
        const centerLocation = (centerRows[0] && centerRows[0].location) ? centerRows[0].location.trim() : null;

        let rows;
        if (!centerLocation) {
            // No location — fall back to center_id only
            [rows] = await db.query(
                `SELECT COUNT(*) AS count, COALESCE(MAX(r.request_id), 0) AS latestId
                 FROM tbl_pickup_requests r
                 WHERE r.center_id = ?
                   AND r.status NOT IN ('Completed', 'Rejected', 'Cancelled')`,
                [centerId]
            );
        } else {
            // Location-based + center_id + address fallback (consistent with getCenterRequests)
            const locationPattern = `%${centerLocation}%`;
            [rows] = await db.query(
                `SELECT COUNT(*) AS count, COALESCE(MAX(r.request_id), 0) AS latestId
                 FROM tbl_pickup_requests r
                 JOIN tbl_users u ON r.user_id = u.user_id
                 WHERE (
                     LOWER(TRIM(COALESCE(u.location, ''))) = LOWER(?)
                     OR LOWER(r.address) LIKE LOWER(?)
                     OR r.center_id = ?
                 )
                   AND r.status NOT IN ('Completed', 'Rejected', 'Cancelled')`,
                [centerLocation, locationPattern, centerId]
            );
        }

        res.json({ count: rows[0].count, latestId: rows[0].latestId });
    } catch (e) {
        res.json({ count: 0, latestId: 0 });
    }
};


// 11. Get All Pickup Requests (Admin/Reports — NO location filtering)
export const getAllPickupRequests = async (req, res) => {
    try {
        const query = `
            SELECT 
                r.request_id,
                r.status,
                r.waste_type,
                r.quantity,
                r.address,
                r.created_at,
                r.estimated_pickup_time,
                u.name  AS user_name,
                u.email AS user_email,
                u.location AS user_location,
                COALESCE(c.center_name, 'Unassigned') AS center_name
            FROM tbl_pickup_requests r
            INNER JOIN tbl_users u ON r.user_id = u.user_id
            LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
            ORDER BY r.created_at DESC
            LIMIT 100
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('[getAllPickupRequests] DB Error:', error.message, error.code);
        res.status(500).json({
            message: 'Error fetching pickup requests.',
            detail: error.message,
            code: error.code
        });
    }
};

