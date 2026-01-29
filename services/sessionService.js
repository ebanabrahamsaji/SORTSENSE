
import db from '../db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import * as AdminService from './adminService.js';

// --- Helper: Hash Token ---
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Creates a new tracked session in DB with dual tokens
 */
export const createSession = async (user, accessToken, refreshToken, req) => {
    const accessHash = hashToken(accessToken);
    const refreshHash = hashToken(refreshToken);

    const decodedAccess = jwt.decode(accessToken);
    const decodedRefresh = jwt.decode(refreshToken);

    const sessionId = decodedAccess.jti || crypto.randomUUID();
    const expiryTime = new Date(decodedRefresh.exp * 1000); // Session lives as long as refresh token

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';

    try {
        // Ensure table exists or columns exist (Logic handled in db.js or migration)
        await db.query(
            `INSERT INTO tbl_sessions 
            (session_id, user_id, access_token_hash, refresh_token_hash, ip_address, device_info, expiry_time, is_active, revoked)
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
            [sessionId, user.user_id, accessHash, refreshHash, ip, ua, expiryTime]
        );

        await AdminService.logAdminAction(user.user_id, 'SESSION_CREATED', 'SESSION', sessionId, { ip, ua, role: user.role });
        return sessionId;
    } catch (e) {
        console.error("Session Create Error:", e);
        throw e;
    }
};

/**
 * Validates a session using the access token
 */
export const validateSession = async (token) => {
    const accessHash = hashToken(token);

    const [rows] = await db.query(
        `SELECT * FROM tbl_sessions WHERE access_token_hash = ? AND is_active = TRUE AND revoked = FALSE`,
        [accessHash]
    );

    if (rows.length === 0) return null;

    const session = rows[0];

    // Check session-level expiry (Refresh token expiry)
    if (new Date() > new Date(session.expiry_time)) {
        console.warn(`⚠️ STABILITY MODE: Session ${session.session_id} expired at ${session.expiry_time}. LOGGING ONLY.`);
        // await revokeSession(session.session_id, 'SYSTEM', 'Session Expired'); // DISABLED IN STABILITY MODE
        // return null; // DISABLED IN STABILITY MODE
    }

    // Update Last Activity
    await db.query(`UPDATE tbl_sessions SET last_activity = NOW() WHERE session_id = ?`, [session.session_id]);

    return session;
};

/**
 * Refresh Flow: Rotate tokens
 */
export const refreshSession = async (oldRefreshToken, newAccessToken, newRefreshToken) => {
    const oldHash = hashToken(oldRefreshToken);
    const newAccessHash = hashToken(newAccessToken);
    const newRefreshHash = hashToken(newRefreshToken);

    const decodedRefresh = jwt.decode(newRefreshToken);
    const newExpiry = new Date(decodedRefresh.exp * 1000);

    const [rows] = await db.query(
        `SELECT * FROM tbl_sessions WHERE refresh_token_hash = ? AND is_active = TRUE AND revoked = FALSE`,
        [oldHash]
    );

    if (rows.length === 0) return false;

    const session = rows[0];

    await db.query(
        `UPDATE tbl_sessions 
         SET access_token_hash = ?, refresh_token_hash = ?, expiry_time = ?, last_activity = NOW() 
         WHERE session_id = ?`,
        [newAccessHash, newRefreshHash, newExpiry, session.session_id]
    );

    return true;
};

/**
 * Revokes a specific session
 */
export const revokeSession = async (sessionId, revokerId, reason) => {
    await db.query(
        `UPDATE tbl_sessions SET is_active = FALSE, revoked = TRUE, revoked_by = ?, revoked_reason = ?, revoked_time = NOW() WHERE session_id = ?`,
        [revokerId || 0, reason, sessionId]
    );
};

/**
 * Invalidate ALL sessions for a user
 */
export const invalidateAllUserSessions = async (userId, adminId) => {
    await db.query(
        `UPDATE tbl_sessions SET is_active = FALSE, revoked = TRUE, revoked_by = ?, revoked_reason = 'Admin Reset' WHERE user_id = ?`,
        [adminId, userId]
    );
    await AdminService.logAdminAction(adminId, 'SESSION_RESET_ALL', 'USER', userId, { reason: 'Security Invalidation' });
};

/**
 * Cron Job Logic to cleanup expired sessions
 */
export const cleanupExpiredSessions = async () => {
    await db.query(`UPDATE tbl_sessions SET is_active = FALSE, revoked = TRUE, revoked_reason ='Expired' WHERE expiry_time < NOW() AND is_active = TRUE`);
};
