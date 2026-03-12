import db from '../db.js';
import moderationService from '../services/moderationService.js';

const ABUSE_WORDS = ['spam', 'abuse', 'fake', 'fraud', 'steal', 'hack', 'fuck', 'shit', 'scam', 'idiot'];


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
            // Priority: Explicit center_id, then id fallback
            senderId = user.center_id || user.id;
        } else {
            // Priority: Explicit user_id, then id fallback
            senderId = user.user_id || user.id;
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

        // 4. Abuse word detection in user messages → +25 (abuse complaint)
        if (senderRole === 'user') {
            const lowerMsg = message.toLowerCase();
            const foundAbuse = ABUSE_WORDS.filter(w => lowerMsg.includes(w));
            if (foundAbuse.length > 0) {
                moderationService.handleCenterAbuseComplaint(senderId, receiverId, `Abusive message: ${foundAbuse.join(', ')}`)
                    .catch(e => console.error('[Moderation] Abuse complaint hook error:', e.message));
            }
        }

        // 5. Spam rate check: if user sends ≥5 messages in 1 hour → +20
        if (senderRole === 'user') {
            try {
                const [recentMsgs] = await db.query(`
                    SELECT COUNT(*) AS cnt FROM tbl_user_center_messages
                    WHERE sender_id = ? AND sender_role = 'user'
                      AND created_at >= NOW() - INTERVAL 1 HOUR
                `, [senderId]);
                if ((recentMsgs[0].cnt || 0) >= 5) {
                    moderationService.handleSpamMessage(senderId, `${recentMsgs[0].cnt + 1} messages to centers in last hour`)
                        .catch(e => console.error('[Moderation] Spam hook error:', e.message));
                }
            } catch (_) { }
        }

        // 6. Save message
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

        // 3. Fetch messages with populated SENDER names only
        const [messages] = await db.query(`
            SELECT 
                m.*,
                u.name as senderUserName,
                c.center_name as senderCenterName
            FROM tbl_user_center_messages m
            LEFT JOIN tbl_users u ON (m.sender_role = 'user' AND m.sender_id = u.user_id)
            LEFT JOIN tbl_collection_centers c ON (m.sender_role = 'center' AND m.sender_id = c.center_id)
            WHERE m.request_id = ?
            ORDER BY m.created_at ASC
        `, [requestId]);

        // Cleanup names to return only the relevant one per message
        const formattedMessages = messages.map(msg => {
            const role = String(msg.sender_role).toLowerCase();
            return {
                ...msg,
                sender_role: role, // Ensure lowercase for frontend stability
                senderName: role === 'user' ? (msg.senderUserName || 'User') : (msg.senderCenterName || 'Center')
            };
        });

        res.json({ success: true, data: formattedMessages });

    } catch (error) {
        console.error("Get User-Center Messages Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch messages" });
    }
};
