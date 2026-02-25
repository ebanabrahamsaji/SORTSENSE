import ModerationService, { USER_STATUS } from '../services/moderationService.js';
import db from '../db.js';

export const reportUser = async (req, res) => {
    const { reporterId, targetId, category, description } = req.body;

    if (!reporterId || !targetId) {
        return res.status(400).json({ success: false, message: "Reporter and Target IDs are required" });
    }

    try {
        // 1. Save the report
        await db.query(
            "INSERT INTO tbl_user_reports (reporter_id, target_id, category, description) VALUES (?, ?, ?, ?)",
            [reporterId, targetId, category || 'Other', description || '']
        );

        // 2. Automated adjustment using dedicated handler
        await ModerationService.handleReport(targetId, `Reported for ${category}: ${description}`);

        res.json({ success: true, message: "Report submitted. Our team will review it." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getFlaggedUsers = async (req, res) => {
    try {
        const users = await ModerationService.getFlaggedUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateStatusManual = async (req, res) => {
    const { userId, status, reason, adminId } = req.body;

    // Check if status is valid
    if (!Object.values(USER_STATUS).includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    try {
        await ModerationService.manualStatusUpdate(userId, status, reason, adminId || 1);
        res.json({ success: true, message: `User status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getModerationLogs = async (req, res) => {
    const { userId } = req.query;
    try {
        const logs = await ModerationService.getModerationLogs(userId);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateRiskScoreSystem = async (req, res) => {
    const { userId, increment, reason } = req.body;
    try {
        const result = await ModerationService.updateRiskScore(userId, increment, reason);
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const submitAppeal = async (req, res) => {
    const { userId, reason } = req.body;
    if (!userId || !reason) return res.status(400).json({ success: false, message: "User ID and reason are required" });

    try {
        await db.query("INSERT INTO tbl_moderation_appeals (user_id, reason) VALUES (?, ?)", [userId, reason]);
        res.json({ success: true, message: "Appeal submitted successfully. We will review it shortly." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getPendingAppeals = async (req, res) => {
    try {
        const [appeals] = await db.query(`
            SELECT a.*, u.name as user_name, u.email as user_email 
            FROM tbl_moderation_appeals a
            JOIN tbl_users u ON a.user_id = u.user_id
            WHERE a.status = 'PENDING'
        `);
        res.json(appeals);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const resolveAppeal = async (req, res) => {
    const { appealId, decision, adminNotes, adminId } = req.body;

    try {
        const [appeals] = await db.query("SELECT user_id FROM tbl_moderation_appeals WHERE appeal_id = ?", [appealId]);
        if (appeals.length === 0) return res.status(404).json({ message: "Appeal not found" });
        const userId = appeals[0].user_id;

        await db.query("UPDATE tbl_moderation_appeals SET status = ?, admin_notes = ? WHERE appeal_id = ?", [decision, adminNotes, appealId]);

        if (decision === 'APPROVED') {
            await ModerationService.manualStatusUpdate(userId, USER_STATUS.ACTIVE, "Appeal approved by admin", adminId || 1);
            await db.query("UPDATE tbl_users SET risk_score = 0 WHERE user_id = ?", [userId]);
        }

        res.json({ success: true, message: `Appeal ${decision.toLowerCase()}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUserReports = async (req, res) => {
    try {
        const [reports] = await db.query(`
            SELECT r.*, 
                   u1.name as reporter_name, u1.email as reporter_email,
                   u2.name as target_name, u2.email as target_email
            FROM tbl_user_reports r
            JOIN tbl_users u1 ON r.reporter_id = u1.user_id
            JOIN tbl_users u2 ON r.target_id = u2.user_id
            ORDER BY r.created_at DESC
        `);
        res.json(reports);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
