import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import db from './db.js';

// ── Security Packages ─────────────────────────────────
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xssClean from 'xss-clean';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import centerRoutes from './routes/centerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import specialWasteRoutes from './routes/specialWasteRoutes.js';

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Security Middleware ───────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Disabled so inline scripts/styles still work in dev
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(xssClean());                // Sanitize req.body, req.query against XSS

// Rate Limiter — 5000 requests per 15 minutes per IP (Effectively Disabled for Dev)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);          // Apply only to API routes

// Auth-specific stricter limiter — 5000 attempts per 15 min (Effectively Disabled for Dev)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000, // Increased for development testing
    message: { error: 'Too many login attempts, please try again later.' }
});

// ── Core Middleware ───────────────────────────────────
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Marketplace Image Upload ──────────────────────────────────────────────────
const mpUploadDir = path.join(__dirname, 'uploads', 'marketplace');
if (!fs.existsSync(mpUploadDir)) fs.mkdirSync(mpUploadDir, { recursive: true });

const mpStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, mpUploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `mp_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, name);
    }
});
const mpUpload = multer({
    storage: mpStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed.'));
    }
});

app.post('/api/marketplace/upload', mpUpload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const url = `/uploads/marketplace/${req.file.filename}`;
    res.json({ success: true, url });
});

// ── API Routes ────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);   // Strict rate limit on auth
app.use('/api/waste', wasteRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/special-waste', specialWasteRoutes);

// Feature 1: Chatbot Route
import chatbotRoutes from './routes/chatbotRoutes.js';
app.use('/api/chatbot', chatbotRoutes);

// Feature 2: Scan History Route
import historyRoutes from './routes/historyRoutes.js';
app.use('/api/user', historyRoutes);

// Strict User Profile Route
import userRoutes from './routes/userRoutes.js';
app.use('/api/user', userRoutes);

// Pickup Routes
import pickupRoutes from './routes/pickupRoutes.js';
app.use('/api/pickup', pickupRoutes);

// Gamification & Marketplace Routes
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import marketplaceRoutes from './routes/marketplaceRoutes.js';
app.use('/api/gamification', leaderboardRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// ── Step 3: Marketplace Save & Contact ───────────────
const savedItems = new Map(); // In-memory store (upgrade to DB later)

app.post('/api/marketplace/save', async (req, res) => {
    try {
        const { item_id, user_id } = req.body;
        if (!item_id || !user_id) return res.status(400).json({ error: 'item_id and user_id required' });
        const key = `${user_id}_${item_id}`;
        const alreadySaved = savedItems.has(key);
        if (alreadySaved) {
            savedItems.delete(key);
            return res.json({ success: true, saved: false, message: 'Item unsaved' });
        }
        savedItems.set(key, { item_id, user_id, saved_at: new Date() });
        res.json({ success: true, saved: true, message: 'Item saved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save item' });
    }
});

app.post('/api/marketplace/contact', async (req, res) => {
    try {
        const { item_id, buyer_id, message } = req.body;
        if (!item_id || !buyer_id || !message) return res.status(400).json({ error: 'Missing fields' });
        // Log contact request (extend with email/notification later)
        console.log(`📩 Contact Request — Item: ${item_id} | Buyer: ${buyer_id} | Msg: ${message}`);
        // Trigger notification to seller
        await notifyUser({ user_id: null, type: 'contact', message: `Someone is interested in your item #${item_id}` });
        res.json({ success: true, message: 'Contact request sent to seller' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send contact request' });
    }
});

// ── Step 4: Special Waste Status Update ──────────────
app.post('/api/special-waste/status', async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) return res.status(400).json({ error: 'id and status required' });
        const validStatuses = ['pending', 'approved', 'rejected', 'collected'];
        if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
        await db.query('UPDATE tbl_special_waste_requests SET status = ? WHERE id = ?', [status, id]);
        // Notify user about status change
        await notifyUser({ user_id: null, type: 'special_waste', message: `Your special waste request #${id} is now ${status}` });
        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        console.error('Special Waste Status Error:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// ── Step 5: Gamification — Badge Check ───────────────
app.post('/api/gamification/check-badges', async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ error: 'user_id required' });

        const [rows] = await db.query(
            'SELECT eco_points, total_scans, total_pickups FROM tbl_users WHERE user_id = ?', [user_id]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        const user = rows[0];
        const unlockedBadges = [];

        const badgeRules = [
            { id: 'eco_starter', label: '🌱 Eco Starter', condition: user.eco_points >= 50 },
            { id: 'eco_champion', label: '🏆 Eco Champion', condition: user.eco_points >= 500 },
            { id: 'first_scan', label: '🔍 First Scan', condition: user.total_scans >= 1 },
            { id: 'scan_master', label: '🤖 Scan Master', condition: user.total_scans >= 10 },
            { id: 'first_pickup', label: '🚛 First Pickup', condition: user.total_pickups >= 1 },
            { id: 'pickup_hero', label: '💪 Pickup Hero', condition: user.total_pickups >= 5 },
        ];

        for (const badge of badgeRules) {
            if (badge.condition) {
                // Check if already awarded
                const [existing] = await db.query(
                    'SELECT * FROM tbl_user_badges WHERE user_id = ? AND badge_id = ?', [user_id, badge.id]
                ).catch(() => [[]]); // Graceful fallback if table doesn't exist yet
                if (!existing.length) {
                    await db.query(
                        'INSERT IGNORE INTO tbl_user_badges (user_id, badge_id, awarded_at) VALUES (?, ?, NOW())',
                        [user_id, badge.id]
                    ).catch(() => { });
                    unlockedBadges.push(badge.label);
                }
            }
        }

        res.json({ success: true, unlocked: unlockedBadges, total_points: user.eco_points });
    } catch (err) {
        console.error('Badge Check Error:', err);
        res.status(500).json({ error: 'Failed to check badges' });
    }
});

// ── Step 6: Notifications ─────────────────────────────
async function notifyUser({ user_id, type, message }) {
    try {
        // Store in DB notification log
        await db.query(
            'INSERT INTO tbl_notifications (user_id, type, message, created_at) VALUES (?, ?, ?, NOW())',
            [user_id, type, message]
        ).catch(() => { }); // Graceful fallback if table doesn't exist yet
        console.log(`🔔 Notification [${type}] → User ${user_id}: ${message}`);
    } catch (err) {
        console.error('Notification Error:', err);
    }
}

app.post('/api/notify', async (req, res) => {
    try {
        const { user_id, type, message } = req.body;
        if (!message) return res.status(400).json({ error: 'message required' });
        await notifyUser({ user_id, type: type || 'general', message });
        res.json({ success: true, message: 'Notification sent' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM tbl_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.params.userId]
        ).catch(() => [[]]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// ── Step 7: Google OAuth Token Verification ───────────
// ── Step 7: Google OAuth Token Verification ───────────
import { OAuth2Client } from 'google-auth-library';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '1033862193558-21l8mqvkjigogomhvonf256av4mmqo8q.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post('/api/auth/google/verify', authLimiter, async (req, res) => {
    try {
        const { token, mockUser } = req.body;
        if (!token) return res.status(400).json({ error: 'Token required' });

        let payload;

        // Mock Bypass for Dev/Localhost (Perfect Login Simulation)
        if (token === 'mock_token_bypass_123' && mockUser) {
            console.log("⚠️ Using Mock Google Login Bypass");
            payload = {
                email: mockUser.email,
                name: mockUser.name,
                picture: mockUser.picture,
                sub: mockUser.sub || 'mock_google_id_' + Date.now()
            };
        } else {
            // Real Verification
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        }

        // Check if user exists in DB, create if not
        const [existing] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [payload.email]);
        let user = existing[0];

        if (!user) {
            await db.query(
                'INSERT INTO tbl_users (name, email, google_id, profile_pic, created_at) VALUES (?, ?, ?, ?, NOW())',
                [payload.name, payload.email, payload.sub, payload.picture]
            ).catch(() => { });
            const [newUser] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [payload.email]);
            user = newUser[0];
        }

        res.json({
            success: true,
            user: {
                user_id: user?.user_id,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                google_id: payload.sub
            }
        });
    } catch (err) {
        // console.error('Google OAuth Error:', err.message); // reduce noise
        res.status(401).json({ error: 'Invalid or expired Google token' });
    }
});

// Alias for frontend compatibility
app.get('/api/activities', (req, res) => {
    res.redirect('/api/admin/activities');
});

// System Info Endpoint (for System Settings)
app.get('/api/system-info', async (req, res) => {
    try {
        const memory = process.memoryUsage();
        const uptime = process.uptime();

        // Format uptime
        let uptimeStr = "";
        if (uptime < 60) uptimeStr = Math.floor(uptime) + " sec";
        else if (uptime < 3600) uptimeStr = Math.floor(uptime / 60) + " min";
        else if (uptime < 86400) uptimeStr = Math.floor(uptime / 3600) + "h " + Math.floor((uptime % 3600) / 60) + "m";
        else uptimeStr = Math.floor(uptime / 86400) + "d " + Math.floor((uptime % 86400) / 3600) + "h";

        res.json({
            ai: global.aiRunning !== undefined ? (global.aiRunning ? "Running" : "Offline") : "Running",
            db: db.isMock ? "Mock DB" : "MySQL",
            uptime: uptimeStr,
            memory: Math.round(memory.rss / 1024 / 1024) + " MB",
            node: process.version
        });
    } catch (err) {
        console.error("System Info Error:", err);
        res.status(500).json({ error: "Failed to fetch system info" });
    }
});

// Base Route
app.get('/', (req, res) => {
    res.send('SortSense Backend API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err.stack);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload Error: ${err.message}` });
    }
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server
// Start Server
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);

        // Start Python AI Service
        console.log("🐍 Starting Python AI Service...");
        import('child_process').then(({ spawn }) => {
            const pythonProcess = spawn('python', ['ml/api.py'], { stdio: 'inherit' });

            pythonProcess.on('error', (err) => {
                console.error("❌ Failed to start Python AI Service:", err);
            });

            pythonProcess.on('exit', (code, signal) => {
                if (code) console.log(`Python AI Service exited with code ${code}`);
                if (signal) console.log(`Python AI Service killed with signal ${signal}`);
            });

            // Cleanup on exit
            process.on('SIGINT', () => {
                pythonProcess.kill();
                process.exit();
            });
        });
    });
};

// Schedule Monthly Reset
import { resetMonthlyLeaderboard } from './controllers/leaderboardController.js';
setInterval(() => {
    const now = new Date();
    // Run on 1st of month at 00:00
    if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        resetMonthlyLeaderboard();
    }
}, 60000); // Check every minute

startServer();
