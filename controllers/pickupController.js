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
            ORDER BY distance ASC
            LIMIT 1
        `;

        const searchType = `%${primaryType}%`;
        const [centers] = await db.query(findCenterQuery, [lat || defaultLat, lng || defaultLng, lat || defaultLat, searchType, searchType]);

        if (centers.length > 0) {
            nearestCenter = centers[0];
        } else {
            // Fallback: If no specific center found, try finding ANY nearest center (General HKS)
            // This handles cases where category mapping might be missing but a center exists.
            const fallbackQuery = `
                SELECT center_id, center_name, 
                (6371 * acos(
                    cos(radians(?)) * cos(radians(latitude)) * 
                    cos(radians(longitude) - radians(?)) + 
                    sin(radians(?)) * sin(radians(latitude))
                )) AS distance
                FROM tbl_collection_centers
                ORDER BY distance ASC LIMIT 1
            `;
            const [fallbackCenters] = await db.query(fallbackQuery, [lat || defaultLat, lng || defaultLng, lat || defaultLat]);
            if (fallbackCenters.length > 0) nearestCenter = fallbackCenters[0];
        }


        if (!nearestCenter) {
            return res.status(404).json({ message: "No collection centers available." });
        }


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
            INSERT INTO tbl_pickup_requests (user_id, center_id, waste_type, quantity, status, latitude, longitude, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(insertQuery, [userId, nearestCenter.center_id, wasteType, quantity, status, lat, lng, address || null]);
        const requestId = result.insertId;

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
            JOIN tbl_collection_centers c ON r.center_id = c.center_id
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
export const getCenterRequests = async (req, res) => {
    const { centerId } = req.query;

    try {
        // Optimized Strategy:
        // 1. Fetch ALL Active Requests (Pending, Approved, Scheduled) - Critical for action
        // 2. Fetch Limited History (Completed, Rejected, Cancelled) - To prevent lag

        const activeQuery = `
            SELECT r.*, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            WHERE r.status NOT IN ('Completed', 'Rejected', 'Cancelled')
            ${centerId ? 'AND r.center_id = ?' : ''}
            ORDER BY r.created_at DESC
        `;

        const historyQuery = `
            SELECT r.*, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            WHERE r.status IN ('Completed', 'Rejected', 'Cancelled')
            ${centerId ? 'AND r.center_id = ?' : ''}
            ORDER BY r.created_at DESC
            LIMIT 50
        `;

        const params = centerId ? [centerId] : [];

        // Execute in parallel
        const [activeReqs, historyReqs] = await Promise.all([
            db.query(activeQuery, params).then(res => res[0]),
            db.query(historyQuery, params).then(res => res[0])
        ]);

        // Combine
        const allRequests = [...activeReqs, ...historyReqs];

        res.json(allRequests);

    } catch (error) {
        console.error("Get Center Requests Error:", error);
        res.status(500).json({ message: "Error fetching center requests." });
    }
};

// 3.5. Get ALL Requests for ADMIN
export const getAllPickupRequests = async (req, res) => {
    try {
        // Admin sees EVERYTHING
        const query = `
            SELECT r.*, u.name as user_name, u.email as user_email, u.phone as user_phone, c.center_name 
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Get All Requests Error:", error);
        res.status(500).json({ message: "Error fetching requests." });
    }
};

// 4. Update Status
export const updatePickupStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status, rejectionReason, estimatedPickupTime } = req.body;

    // STRICT Status Enforcement
    if (!['Pending', 'Approved', 'Completed', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value. Must be Pending, Approved, Completed, or Rejected." });
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
            else if (status === 'Completed') recordStatus = 'Picked';

            await db.query(
                "UPDATE tbl_waste_records SET status = ?, updated_at = NOW() WHERE pickup_id = ?",
                [recordStatus, requestId]
            );
        } catch (syncErr) {
            console.error("Transactional Sync Fail:", syncErr);
        }

        // --- Notification Logic ---
        // Need user_id to notify
        const [uRows] = await db.query("SELECT user_id, center_id FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);
        if (uRows.length > 0) {
            const userId = uRows[0].user_id;
            let notifTitle = "Pickup Update";
            let notifMsg = `Your pickup request #${requestId} status has changed to ${status}.`;
            let notifType = "INFO";

            if (status === 'Approved') {
                notifTitle = "Pickup Approved! ✅";
                notifMsg = `Great news! Your request #${requestId} has been approved.`;
                if (estimatedPickupTime) notifMsg += ` ETA: ${estimatedPickupTime}.`;
                notifType = "SUCCESS";
            } else if (status === 'Rejected') {
                notifTitle = "Pickup Rejected ❌";
                notifMsg = `Your request #${requestId} was rejected.`;
                if (rejectionReason) notifMsg += ` Reason: ${rejectionReason}`;
                notifType = "ERROR";
            } else if (status === 'Completed') {
                notifTitle = "Pickup Completed 🎉";
                notifMsg = `Request #${requestId} has been successfully completed. Thank you for recycling!`;
                notifType = "SUCCESS";
            }

            await db.query(
                "INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [userId, notifTitle, notifMsg, notifType]
            );
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
