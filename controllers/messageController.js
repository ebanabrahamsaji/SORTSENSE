import moderationService from '../services/moderationService.js';
import db from '../db.js';

const ABUSE_WORDS = ['spam', 'abuse', 'fake', 'fraud', 'steal', 'hack', 'fuck', 'shit', 'scam'];

/**
 * Send Message (Admin <-> Center)
 * POST /api/messages/send
 */
export const sendMessage = async (req, res) => {
    try {
        const { center_id, messageText } = req.body;
        const user = req.user || {}; // Safety fallback

        if (!messageText || !messageText.trim()) {
            return res.status(400).json({ success: false, error: "Message content required" });
        }

        const senderId = user.id || user.user_id || user.center_id;

        // --- ABUSE WORD DETECTION ---
        const lowerMsg = messageText.toLowerCase();
        const foundAbuse = ABUSE_WORDS.filter(word => lowerMsg.includes(word));

        if (foundAbuse.length > 0) {
            console.log(`⚠️ Abuse words detected in message from User ${senderId}: ${foundAbuse.join(', ')}`);
            await moderationService.handleContentViolation(senderId, 'ABUSE', `Message contained: ${foundAbuse.join(', ')}`);
            return res.status(400).json({
                success: false,
                error: "Your message was blocked because it contains prohibited language. This incident has been logged for moderation."
            });
        }
        // ----------------------------

        const senderRole = (user.role || '').toUpperCase();
        console.log(`[sendMessage] DEBUG: Sender id=${senderId}, role=${senderRole}. Body center_id=${center_id}`);

        let senderName = "Administrator";
        let receiverId = center_id;
        let receiverRole = "CENTER";
        let targetCenterId = center_id;

        if (senderRole === 'CENTER') {
            senderName = user.name || user.username || 'Center';
            receiverRole = 'ADMIN';
            targetCenterId = senderId;


            // Dynamically resolve the admin's user_id — do NOT hardcode
            try {
                const [adminRows] = await db.query(
                    "SELECT user_id FROM tbl_users WHERE role = 'ADMIN' ORDER BY user_id ASC LIMIT 1"
                );
                receiverId = adminRows.length > 0 ? adminRows[0].user_id : 1;
            } catch (e) {
                console.error('[sendMessage] Failed to resolve admin ID, falling back to 1:', e.message);
                receiverId = 1;
            }
            console.log(`[sendMessage] CENTER reply → targetCenterId=${targetCenterId}, receiverId=${receiverId}`);
        } else if (senderRole === 'ADMIN') {
            if (!targetCenterId) {
                return res.status(400).json({ success: false, error: "Target center_id required for admin" });
            }

            senderName = "Administrator";
            receiverId = targetCenterId;
            receiverRole = 'CENTER';
            console.log(`[sendMessage] ADMIN → center_id=${targetCenterId}, senderId=${senderId}`);
        } else {
            return res.status(403).json({ success: false, error: "Invalid role for messaging" });
        }

        // --- Delivery Status Logic (Part 1 & 4) ---
        let deliveryStatus = 'sent';
        const [centerRows] = await db.query(
            "SELECT center_status FROM tbl_collection_centers WHERE center_id = ?",
            [targetCenterId]
        );

        if (centerRows.length > 0) {
            const status = centerRows[0].center_status || 'offline';
            if (status === 'offline') {
                deliveryStatus = 'pending';
            }
        }

        await db.query(`
            INSERT INTO tbl_center_messages 
            (center_id, sender_id, sender_role, sender_name, receiver_id, receiver_role, message_text, created_at, is_read, delivery_status, sent_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 0, ?, NOW())
        `, [targetCenterId, senderId, senderRole, senderName, receiverId, receiverRole, messageText, deliveryStatus]);

        // --- Notifications ---
        try {
            if (senderRole === 'ADMIN') {
                // Notify Center
                await db.query(
                    "INSERT INTO tbl_center_notifications (center_id, type, title, message) VALUES (?, ?, ?, ?)",
                    [receiverId, 'ALERT', 'New Message from Admin', `You have a new message: "${messageText.substring(0, 30)}..."`]
                );
            } else if (senderRole === 'CENTER') {
                // Notify Admin
                await db.query(
                    "INSERT INTO tbl_admin_notifications (type, title, message, reference_id) VALUES (?, ?, ?, ?)",
                    ['MESSAGE', 'Message from Center', `${senderName} sent a message: "${messageText.substring(0, 30)}..."`, senderId]
                );
            }
        } catch (e) {
            console.error("Message Notif Error:", e);
        }

        res.json({ success: true, message: "Message sent", deliveryStatus });

    } catch (error) {
        console.error("Send Message Error:", error);
        // PART 2 FIX: Return 500 but as valid JSON
        return res.status(500).json({ success: false, error: "Network or Server error — message not sent" });
    }
};

/**
 * Get Conversation History for Center
 * GET /api/messages/center/:centerId
 */
export const getCenterMessages = async (req, res) => {
    const { centerId } = req.params;
    const user = req.user || {};

    // Security: Center can only see its own conversation.
    const currentId = user.id || user.user_id || user.center_id;
    const role = (user.role || '').toUpperCase();

    // 🔍 DEBUG LOG REQUIREMENT 5/6: Track IDs
    console.log(`[getCenterMessages] DEBUG: Processing fetch for Center ${centerId}. Authenticated User: id=${currentId}, role=${role}`);

    if (role === 'CENTER' && String(currentId) !== String(centerId)) {
        console.warn(`[getCenterMessages] ❌ REJECTION: Unauthorized center ID mismatch. currentId=${currentId} !== centerId=${centerId}`);
        return res.status(403).json({ success: false, error: "Unauthorized access: You can only view your own messages." });
    }

    try {
        // Mark pending messages as delivered when center fetches them
        await db.query(`
            UPDATE tbl_center_messages 
            SET delivery_status = 'delivered', delivered_time = NOW() 
            WHERE center_id = ? AND receiver_role = 'CENTER' AND delivery_status = 'pending'
        `, [centerId]);


        const [rows] = await db.query(`
            SELECT 
                message_id as id,
                sender_id as senderId,
                sender_role as senderRole,
                sender_name as senderName,
                receiver_id as receiverId,
                receiver_role as receiverRole,
                message_text as messageText,
                created_at as timestamp,
                is_read as isRead,
                delivery_status as deliveryStatus,
                sent_time as sentTime,
                delivered_time as deliveredTime,
                read_time as readTime
            FROM tbl_center_messages
            WHERE center_id = ?
            ORDER BY created_at ASC
        `, [centerId]);

        console.log(`[getCenterMessages] centerId=${centerId} → ${rows.length} messages returned.`);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Center Messages Error:", error);
        res.json({ success: true, data: [], error: "History temporarily unavailable" });
    }
};

/**
 * Get Conversation History for Admin
 * GET /api/messages/admin/:centerId
 */
export const getAdminMessages = async (req, res) => {
    const { centerId } = req.params;
    const user = req.user;

    // Diagnostic: log what the middleware passed through
    console.log(`[getAdminMessages] User: ${JSON.stringify({ id: user?.id, role: user?.role })} | CenterId: ${centerId}`);

    // Security: Admin can see all center conversations.
    if (!user || !user.role || user.role.toUpperCase() !== 'ADMIN') {
        console.warn(`[getAdminMessages] ❌ Role mismatch. Expected ADMIN, got: '${user?.role}'`);
        return res.status(403).json({ success: false, error: "Unauthorized access: Admin only." });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                message_id as id,
                sender_id as senderId,
                sender_role as senderRole,
                sender_name as senderName,
                receiver_id as receiverId,
                receiver_role as receiverRole,
                message_text as messageText,
                created_at as timestamp,
                is_read as isRead,
                delivery_status as deliveryStatus,
                sent_time as sentTime,
                delivered_time as deliveredTime,
                read_time as readTime
            FROM tbl_center_messages
            WHERE center_id = ?
            ORDER BY created_at ASC
        `, [centerId]);


        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Get Admin Messages Error:", error);
        // PART 1 FIX: Always return valid JSON and a success structure even on error
        res.json({ success: true, data: [], error: "History temporarily unavailable" });
    }
};
/**
 * Mark Messages as Read
 * POST /api/messages/read
 */
export const markMessagesRead = async (req, res) => {
    const { centerId } = req.body;
    const user = req.user;

    try {
        const role = user.role;
        const receiverRole = role === 'ADMIN' ? 'ADMIN' : 'CENTER';

        await db.query(`
            UPDATE tbl_center_messages 
            SET is_read = 1, delivery_status = 'read', read_time = NOW() 
            WHERE center_id = ? AND receiver_role = ? AND is_read = 0
        `, [centerId, receiverRole]);

        res.json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.error("Mark Read Error:", error);
        return res.json({ success: true, message: "Mark read skipped" }); // Non-critical failure
    }
};
