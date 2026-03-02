import db from '../db.js';

/**
 * Send Message (User <-> Assigned Center)
 * POST /api/user-center/send
 */
export const sendUserCenterMessage = async (req, res) => {
    try {
        const { requestId, message } = req.body;
        const user = req.user;

        if (!requestId || !message || !message.trim()) {
            return res.status(400).json({ success: false, error: "requestId and message are required" });
        }

        const senderRole = user.role.toLowerCase(); // 'user' or 'center'

        if (senderRole !== 'user' && senderRole !== 'center') {
            return res.status(403).json({ success: false, error: "Invalid role for this messaging channel" });
        }

        let senderId;
        if (senderRole === 'center') {
            // For a Center User, priority must be given to center_id vs their auth user_id
            senderId = user.center_id || user.id || user.user_id;
        } else {
            senderId = user.id || user.user_id || user.center_id;
        }

        // 1. Fetch pickup request
        const [pickupRows] = await db.query(
            "SELECT * FROM tbl_pickup_requests WHERE request_id = ?",
            [requestId]
        );

        if (pickupRows.length === 0) {
            return res.status(404).json({ success: false, error: "Pickup request not found" });
        }

        const pickup = pickupRows[0];

        // 2. Validate status and assigned center
        const allowedStatusesForMessaging = ['Scheduled', 'Approved', 'Collected', 'Completed'];
        if (!allowedStatusesForMessaging.includes(pickup.status)) {
            return res.status(403).json({ success: false, error: "Messaging is not allowed for this request status" });
        }

        if (!pickup.center_id) {
            return res.status(403).json({ success: false, error: "No center assigned to this request" });
        }

        // 3. Validate sender ownership
        let receiverId;
        let receiverRole;

        if (senderRole === 'user') {
            if (String(senderId) !== String(pickup.user_id)) {
                return res.status(403).json({ success: false, error: "Unauthorized: You are not the owner of this request" });
            }
            receiverId = pickup.center_id;
            receiverRole = 'center';
        } else {
            // senderRole === 'center'
            if (String(senderId) !== String(pickup.center_id)) {
                return res.status(403).json({ success: false, error: "Unauthorized: You are not the assigned center for this request" });
            }
            receiverId = pickup.user_id;
            receiverRole = 'user';
        }

        // 4. Save message
        await db.query(`
            INSERT INTO tbl_user_center_messages 
            (sender_id, sender_role, receiver_id, receiver_role, request_id, message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [senderId, senderRole, receiverId, receiverRole, requestId, message]);

        res.json({ success: true, message: "Message sent successfully" });

    } catch (error) {
        console.error("Send User-Center Message Error:", error);
        res.status(500).json({ success: false, error: "Failed to send message" });
    }
};

/**
 * Get Messages for a specific Pickup Request
 * GET /api/user-center/:requestId
 */
export const getUserCenterMessages = async (req, res) => {
    try {
        const { requestId } = req.params;
        const user = req.user;
        const userRole = user.role.toLowerCase();

        let userId;
        if (userRole === 'center') {
            userId = user.center_id || user.id || user.user_id;
        } else {
            userId = user.id || user.user_id || user.center_id;
        }

        if (!requestId) {
            return res.status(400).json({ success: false, error: "requestId required" });
        }

        // 1. Fetch pickup request for validation
        const [pickupRows] = await db.query(
            "SELECT * FROM tbl_pickup_requests WHERE request_id = ?",
            [requestId]
        );

        if (pickupRows.length === 0) {
            return res.status(404).json({ success: false, error: "Pickup request not found" });
        }

        const pickup = pickupRows[0];

        // 2. Security Check: Only the involved user or center can view
        const isOwnerUser = userRole === 'user' && String(userId) === String(pickup.user_id);
        const isAssignedCenter = userRole === 'center' && String(userId) === String(pickup.center_id);

        if (!isOwnerUser && !isAssignedCenter && userRole !== 'admin') {
            return res.status(403).json({ success: false, error: "Unauthorized access to these messages" });
        }

        // 3. Fetch messages with populated names
        // Note: Population requirement - DO NOT store usernames directly, populate when fetching.
        // We'll join with tbl_users (for user) and tbl_collection_centers (for center).

        const [messages] = await db.query(`
            SELECT 
                m.*,
                u.name as username,
                c.center_name as centerUsername
            FROM tbl_user_center_messages m
            LEFT JOIN tbl_users u ON (m.sender_role = 'user' AND m.sender_id = u.user_id) OR (m.receiver_role = 'user' AND m.receiver_id = u.user_id)
            LEFT JOIN tbl_collection_centers c ON (m.sender_role = 'center' AND m.sender_id = c.center_id) OR (m.receiver_role = 'center' AND m.receiver_id = c.center_id)
            WHERE m.request_id = ?
            ORDER BY m.created_at ASC
        `, [requestId]);

        // Cleanup names to return only the relevant one per message
        const formattedMessages = messages.map(msg => {
            return {
                message_id: msg.message_id,
                sender_id: msg.sender_id,
                sender_role: msg.sender_role,
                receiver_id: msg.receiver_id,
                receiver_role: msg.receiver_role,
                request_id: msg.request_id,
                message: msg.message,
                created_at: msg.created_at,
                is_read: msg.is_read,
                // Populate names correctly
                senderName: msg.sender_role === 'user' ? msg.username : msg.centerUsername,
                receiverName: msg.receiver_role === 'user' ? msg.username : msg.centerUsername
            };
        });

        res.json({ success: true, data: formattedMessages });

    } catch (error) {
        console.error("Get User-Center Messages Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch messages" });
    }
};
