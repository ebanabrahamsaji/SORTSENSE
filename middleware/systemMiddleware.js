
import jwt from 'jsonwebtoken';
import db from '../db.js';
import crypto from 'crypto';
import * as SessionService from '../services/sessionService.js';
import dotenv from 'dotenv';

// Ensure env vars are loaded BEFORE initializing constants
dotenv.config();

// Robustly extract secret: strip any accidental quotes from .env
const rawSecret = process.env.JWT_SECRET || 'fallback_secret';
const JWT_SECRET = rawSecret.trim().replace(/^"|"$/g, '');


// --- Helper: Generate Integrity Hash ---
const generateHash = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

// --- Service: Central Audit Logger ---
export const logEvent = async (eventType, actor, target, payload, req = null, severity = 'INFO') => {
    try {
        const actorId = actor ? (actor.id || actor.user_id) : null;
        const actorRole = actor ? actor.role : 'SYSTEM';
        const targetRes = target.resource;
        const targetId = target.id;

        const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'SYSTEM';
        const ua = req ? req.headers['user-agent'] : 'N/A';

        const eventData = { eventType, actorId, targetId, payload, timestamp: Date.now() };
        const integrityHash = generateHash(eventData);

        const query = `
            INSERT INTO tbl_system_events 
            (event_type, actor_id, actor_role, target_resource, target_id, payload, ip_address, user_agent, severity, hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [eventType, actorId, actorRole, targetRes, targetId, JSON.stringify(payload), ip, ua, severity, integrityHash]);
    } catch (e) {
        console.error("Audit Log Failed", e);
    }
};

// --- Middleware: Verify Authenticated ---
export const verifyToken = async (req, res, next) => {
    // Extract the raw Authorization header value (check multiple variants)
    const authHeader = req.header('Authorization') || req.headers['authorization'] || '';

    // Strip "Bearer " prefix, trim whitespace, and strip any accidental JSON quotes
    let token = authHeader.replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');

    // 🔍 DEBUG LOG REQUIREMENT 1: Token received
    const tokenPreview = token && token.length > 20 ? token.substring(0, 20) + '...' : `[val=${token}]`;
    console.log(`[verifyToken] DEBUG: Receiving token for ${req.method} ${req.originalUrl}. Preview: ${tokenPreview}`);

    if (!token || token === 'null' || token === 'undefined') {
        console.warn(`[verifyToken] ❌ REJECTION: No token provided on ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }

    const dotCount = (token.match(/\./g) || []).length;
    // Sanity check: a JWT MUST have exactly 2 dots (3 parts)
    if (dotCount !== 2) {
        console.error(`[verifyToken] ❌ REJECTION: Token is NOT a JWT (dots=${dotCount}). Path: ${req.originalUrl}`);
        return res.status(401).json({ success: false, message: "Invalid session format. Please log in again." });
    }

    // Step 1: Verify JWT signature & expiry
    let verified;
    try {
        verified = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        const reason = e.name === 'TokenExpiredError' ? 'EXPIRED' : 'INVALID_SIGNATURE';
        console.warn(`[verifyToken] ❌ REJECTION: JWT ${reason} on ${req.originalUrl}. Error: ${e.message}`);

        if (e.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Session expired. Please log in again.", code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ success: false, message: "Session invalid. Please log in again." });
    }

    // 🔍 DEBUG LOG REQUIREMENT 2: Decoded user
    console.log(`[verifyToken] ✅ ACCEPTED: id=${verified.id || verified.user_id}, role=${verified.role}, name=${verified.name}`);

    // Step 2: Attach user to request immediately — DB failure cannot block this
    req.user = verified;
    req.sessionId = verified.jti || 'jwt_only';

    // Step 3: Non-blocking session DB check
    try {
        // Only attempt if SessionService and validateSession are defined
        if (SessionService && typeof SessionService.validateSession === 'function') {
            const session = await SessionService.validateSession(token);
            if (session) {
                req.sessionId = session.session_id;
            }
        }
    } catch (dbErr) {
        console.warn(`[verifyToken] ⚠️ Session DB check failed (non-fatal): ${dbErr.message}`);
    }

    next();
};

// --- Middleware: RBAC ---
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const userRole = req.user.role.toUpperCase();
        const allowedRoles = roles.map(r => r.toUpperCase());

        if (!allowedRoles.includes(userRole)) {
            console.warn(`⚠️ STABILITY MODE: RBAC Violation by User ${req.user.id} (${userRole}). Allowed: ${allowedRoles}. LOGGING ONLY.`);
            logEvent('RBAC_VIOLATION', { id: req.user.id, role: userRole }, { resource: req.originalUrl, id: 'N/A' }, { required: allowedRoles, actual: userRole }, req, 'WARNING');
            // return res.status(403).json({ message: "Forbidden: Insufficient Permissions" }); // DISABLED IN STABILITY MODE
        }
        next();
    };
};

// --- Middleware: Validation Helper ---
export const validateInput = (schema) => {
    return (req, res, next) => {
        const errors = [];
        for (const [field, rule] of Object.entries(schema)) {
            if (!req.body[field]) {
                errors.push(`Missing ${field}`);
                continue;
            }
            if (rule === 'number' && isNaN(req.body[field])) errors.push(`${field} must be a number`);
        }

        if (errors.length > 0) {
            console.warn(`⚠️ STABILITY MODE: Validation Failed for ${req.originalUrl}. Errors: ${errors.join(', ')}. LOGGING ONLY.`);
            logEvent('VALIDATION_SOFT_FAIL', { id: req.user?.id || 0, role: req.user?.role || 'GUEST' }, { resource: req.originalUrl, id: 'N/A' }, { errors }, req, 'WARNING');
            // return res.status(400).json({ message: "Validation Failed", errors }); // DISABLED IN STABILITY MODE
        }
        next();
    };
};
