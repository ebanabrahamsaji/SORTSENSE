import db from '../db.js';
import { body, validationResult } from 'express-validator';
import moderationService from '../services/moderationService.js';
import { awardPoints } from '../services/rewardService.js';

const ABUSE_WORDS = ['spam', 'abuse', 'fake', 'fraud', 'steal', 'hack', 'fuck', 'shit', 'scam'];

export const getMarketplaceItems = async (req, res) => {
    try {
        const [items] = await db.query(`
            SELECT m.*, u.name AS owner_name 
            FROM tbl_marketplace_items m
            JOIN tbl_users u ON m.user_id = u.user_id
            WHERE m.status = 'active'
            AND m.category IN ('Plastic', 'Paper', 'Glass', 'Metal', 'E-Waste')
            ORDER BY m.created_at DESC
        `);
        res.json(items);
    } catch (error) {
        console.error("Get Marketplace Items Error:", error);
        res.status(500).json({ message: "Failed to fetch items" });
    }
};

// Validation rules for creating a marketplace item
export const validateMarketplaceItem = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isIn(['Plastic', 'Paper', 'Glass', 'Metal', 'E-Waste']).withMessage('Invalid category'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description max 500 characters'),
    body('image_url')
        .optional({ checkFalsy: true })
        .custom(value => {
            if (!value) return true;
            const isFullUrl = /^https?:\/\/.+/.test(value);
            const isLocalPath = /^\/uploads\//.test(value);
            if (!isFullUrl && !isLocalPath) {
                throw new Error('Image must be a valid URL or an uploaded file path');
            }
            return true;
        }),
    body('user_id')
        .notEmpty().withMessage('User ID is required')
];

export const createMarketplaceItem = async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }

    try {
        const { user_id, title, description, category, image_url } = req.body;

        // --- SPAM DETECTION ---
        const [existing] = await db.query(
            "SELECT * FROM tbl_marketplace_items WHERE user_id = ? AND title = ? AND category = ? AND created_at > NOW() - INTERVAL 30 MINUTE",
            [user_id, title, category]
        );
        if (existing.length > 0) {
            console.log(`⚠️ Spam listing detected for user ${user_id}. Penalizing.`);
            await moderationService.handleContentViolation(user_id, 'SPAM', `Repeated marketplace listing: ${title}`);
            return res.status(409).json({ message: "You have already posted a similar item recently. Please wait before posting again." });
        }
        // ----------------------

        const allowed = ["Plastic", "Paper", "Glass", "Metal", "E-Waste"];
        if (!allowed.includes(category)) {
            return res.status(400).json({ message: "Only recyclable waste items allowed" });
        }

        // Verified Category

        await db.query(
            "INSERT INTO tbl_marketplace_items (user_id, title, description, category, image_url) VALUES (?, ?, ?, ?, ?)",
            [user_id, title, description, category, image_url || null]
        );

        // --- MARKETPLACE LISTING BONUS POINTS ---
        await awardPoints(user_id, 25, "posting a recyclable item on the marketplace").catch(e => console.error(e));

        res.status(201).json({ success: true, message: "Item posted successfully" });
    } catch (error) {
        console.error("Create Marketplace Item Error:", error);
        res.status(500).json({ message: "Failed to post item" });
    }
};

export const markInterested = async (req, res) => {
    try {
        const { item_id, user_id } = req.body;

        if (!item_id || !user_id) {
            return res.status(400).json({ message: "Item ID and User ID are required" });
        }

        const [existing] = await db.query(
            "SELECT * FROM tbl_marketplace_interest WHERE item_id = ? AND user_id = ?",
            [item_id, user_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "You are already interested in this item" });
        }

        await db.query(
            "INSERT INTO tbl_marketplace_interest (item_id, user_id) VALUES (?, ?)",
            [item_id, user_id]
        );

        // --- Notification for Owner ---
        try {
            const [ownerRows] = await db.query(
                "SELECT m.user_id as owner_id, m.title, u.name as interested_user FROM tbl_marketplace_items m JOIN tbl_users u ON u.user_id = ? WHERE m.item_id = ?",
                [user_id, item_id]
            );
            if (ownerRows.length > 0) {
                const { owner_id, title, interested_user } = ownerRows[0];
                await db.query(
                    "INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, 'MARKETPLACE')",
                    [owner_id, "New Interest in your item!", `${interested_user} is interested in "${title}". Check your messages.`]
                );
            }
        } catch (e) { console.error("Marketplace Notif Error:", e); }

        res.json({ success: true, message: "Interest recorded" });
    } catch (error) {
        console.error("Mark Interested Error:", error);
        res.status(500).json({ message: "Failed to record interest" });
    }
};

export const deleteMarketplaceItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        const [result] = await db.query(
            "UPDATE tbl_marketplace_items SET status = 'deleted' WHERE item_id = ? AND user_id = ?",
            [id, user_id]
        );

        if (result.affectedRows === 0) {
            console.warn(`⚠️ [Marketplace] Delete failed for ID ${id} with UID ${user_id}. Item may not exist or User mismatch.`);
            return res.status(403).json({ success: false, message: "Could not delete item. Check if you are the owner." });
        }

        res.json({ success: true, message: "Item deleted" });
    } catch (error) {
        console.error("Delete Marketplace Item Error:", error);
        res.status(500).json({ message: "Failed to delete item" });
    }
};

// ── Messaging System ───────────────────────────────────

export const sendMessage = async (req, res) => {
    try {
        const { sender_id, item_id, message } = req.body;

        if (!sender_id || !item_id || !message) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        // --- ABUSE FILTERING ---
        const lowerMsg = message.toLowerCase();
        const foundAbuse = ABUSE_WORDS.filter(word => lowerMsg.includes(word));
        if (foundAbuse.length > 0) {
            await moderationService.handleContentViolation(sender_id, 'ABUSE', `Marketplace message contained: ${foundAbuse.join(', ')}`);
            return res.status(400).json({ success: false, error: "Message blocked due to prohibited language." });
        }
        // -----------------------

        const [items] = await db.query("SELECT user_id, title FROM tbl_marketplace_items WHERE item_id = ?", [item_id]);
        if (items.length === 0) {
            return res.status(404).json({ success: false, error: "Item not found" });
        }

        const seller_id = items[0].user_id;

        if (String(seller_id) === String(sender_id)) {
            return res.status(400).json({ success: false, error: "You cannot message yourself." });
        }

        await db.query(
            `INSERT INTO tbl_marketplace_messages (sender_id, receiver_id, product_id, message_text) 
             VALUES (?, ?, ?, ?)`,
            [sender_id, seller_id, item_id, message]
        );

        // --- Notification for Seller ---
        try {
            const [senderRows] = await db.query("SELECT name FROM tbl_users WHERE user_id = ?", [sender_id]);
            const senderName = senderRows.length > 0 ? senderRows[0].name : "Someone";
            await db.query(
                "INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [seller_id, "New Marketplace Message", `${senderName} sent you a message about "${items[0].title}".`, 'MESSAGE']
            );
        } catch (e) { console.error("Marketplace Notif Error:", e); }

        res.json({ success: true, message: "Message sent successfully" });

    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ success: false, error: "Failed to send message" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const [messages] = await db.query(`
            SELECT 
                m.*,
                sender.name AS sender_name, sender.email AS sender_email, sender.profile_picture AS sender_pic,
                receiver.name AS receiver_name, receiver.email AS receiver_email, receiver.profile_picture AS receiver_pic,
                p.title AS product_title, p.image_url AS product_image
            FROM tbl_marketplace_messages m
            JOIN tbl_users sender ON m.sender_id = sender.user_id
            JOIN tbl_users receiver ON m.receiver_id = receiver.user_id
            JOIN tbl_marketplace_items p ON m.product_id = p.item_id
            WHERE m.receiver_id = ? OR m.sender_id = ?
            ORDER BY m.created_at DESC
        `, [userId, userId]);

        res.json({ success: true, messages });

    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch messages" });
    }
};

export const replyMessage = async (req, res) => {
    try {
        const { sender_id, receiver_id, product_id, message } = req.body;

        if (!sender_id || !receiver_id || !product_id || !message) {
            return res.status(400).json({ success: false, error: "Missing reply fields" });
        }

        // --- ABUSE FILTERING ---
        const lowerMsg = message.toLowerCase();
        const foundAbuse = ABUSE_WORDS.filter(word => lowerMsg.includes(word));
        if (foundAbuse.length > 0) {
            await moderationService.handleContentViolation(sender_id, 'ABUSE', `Marketplace reply contained: ${foundAbuse.join(', ')}`);
            return res.status(400).json({ success: false, error: "Message blocked." });
        }
        // -----------------------

        await db.query(
            `INSERT INTO tbl_marketplace_messages (sender_id, receiver_id, product_id, message_text) 
             VALUES (?, ?, ?, ?)`,
            [sender_id, receiver_id, product_id, message]
        );

        // --- Notification for Receiver ---
        try {
            const [senderRows] = await db.query("SELECT name FROM tbl_users WHERE user_id = ?", [sender_id]);
            const senderName = senderRows.length > 0 ? senderRows[0].name : "Someone";
            const [productRows] = await db.query("SELECT title FROM tbl_marketplace_items WHERE item_id = ?", [product_id]);
            const productTitle = productRows.length > 0 ? productRows[0].title : "an item";

            await db.query(
                "INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [receiver_id, "New Reply Received", `${senderName} replied to your message regarding "${productTitle}".`, 'MESSAGE']
            );
        } catch (e) { console.error("Marketplace Reply Notif Error:", e); }

        res.json({ success: true, message: "Reply sent successfully" });

    } catch (error) {
        console.error("Reply Message Error:", error);
        res.status(500).json({ success: false, error: "Failed to send reply" });
    }
};
