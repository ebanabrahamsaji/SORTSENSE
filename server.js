import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import centerRoutes from './routes/centerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import specialWasteRoutes from './routes/specialWasteRoutes.js';
// app.use('/api/special-waste', specialWasteRoutes);

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: '*', // Allow all for development, can restrict to localhost/domain later
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Static Files (Serve frontend if needed, but primarily for uploads)
app.use(express.static(__dirname));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/special-waste', specialWasteRoutes);

// Strict User Profile Route (Requested)
import userRoutes from './routes/userRoutes.js';
app.use('/api/user', userRoutes);

// Pickup Routes
import pickupRoutes from './routes/pickupRoutes.js';
app.use('/api/pickup', pickupRoutes);

// Alias for frontend compatibility (or update frontend)
app.get('/api/activities', (req, res) => {
    // Redirect logic or just reuse the handler if imported, but simpler to just fetch from the admin route mock
    res.redirect('/api/admin/activities');
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

startServer();
