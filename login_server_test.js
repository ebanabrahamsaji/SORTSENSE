import express from 'express';
// import mongoose from 'mongoose'; // <-- Commenting out MongoDB
import cors from 'cors';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import { transporter } from './email.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// --- MOCK DATABASE (For Demo Purposes) ---
// Since MongoDB might not be running, we'll simulate a user.
// You can add more users here.
const MOCK_USERS = [
    {
        email: "test@example.com",
        password: "$2b$10$YourHashedPasswordHere", // hash for 'password123'
        authProvider: "local",
        resetToken: null,
        resetTokenExpiry: null
    },
    // Adding your email so it works for you
    {
        email: "ebanabraham52@gmail.com",
        password: "mockpassword",
        authProvider: "local",
        resetToken: null,
        resetTokenExpiry: null
    },
    {
        email: "ebanabraham28@gmail.com",
        password: "mockpassword",
        authProvider: "local",
        resetToken: null,
        resetTokenExpiry: null
    }
];

console.log("------------------------------------------------");
console.log("⚠️  RUNNING IN MOCK DB MODE");
console.log("    (No MongoDB installation required)");
console.log("------------------------------------------------");

const PORT = process.env.PORT || 8000;

// --- REGISTER API ---
app.post("/register", async (req, res) => {
    const { fullname, email, password } = req.body;

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in MOCK DB
    const newUser = {
        email,
        password: hashedPassword,
        fullname, // Optional, but good to have
        authProvider: "local",
        resetToken: null,
        resetTokenExpiry: null
    };

    MOCK_USERS.push(newUser);
    console.log("✅ New user registered:", newUser);

    res.status(201).json({ message: "User registered successfully" });
});

// --- FORGOT PASSWORD API ---
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    console.log(`Received request for: ${email}`);

    try {
        // Find user in MOCK_USERS instead of MongoDB
        const user = MOCK_USERS.find(u => u.email === email);

        if (!user) {
            console.log("User not found in mock DB");
            // Maintain security by not revealing non-existence
            return res.json({
                message: "If the email exists, a reset link has been sent"
            });
        }

        // ❌ Google login users
        if (user.authProvider === "google") {
            return res.json({
                message: "Please sign in using Google"
            });
        }

        console.log(`Found user: ${user.email}`);
        console.log(`Generating reset token for: ${user.email}`);

        const token = crypto.randomBytes(32).toString("hex");

        // Save token to mock user
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

        const resetLink = `http://localhost:${PORT}/pages/reset-password.html?token=${token}`;

        console.log(`Attempting to send email to ${user.email}...`);

        await transporter.sendMail({
            from: `"SortSense Support" <${process.env.EMAIL_USER}>`,
            to: user.email, // ⭐ USER ENTERED EMAIL (Dynamic)
            subject: "Reset Your Password - SortSense",
            html: `
          <div style="font-family: sans-serif; padding: 20px;">
              <h3 style="color: #10B981;">Password Reset Request</h3>
              <p>Click the link below to reset your password:</p>
              <a href="${resetLink}" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">This link expires in 15 minutes.</p>
          </div>
        `
        });

        console.log(`✅ Email sent successfully to ${email}`);
        res.json({ message: "Reset link sent to your email" });

    } catch (error) {
        console.error("❌ Link generation error:", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

// --- RESET PASSWORD API ---
app.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    try {
        // Find user with valid token
        const user = MOCK_USERS.find(u =>
            u.resetToken === token &&
            u.resetTokenExpiry > Date.now()
        );

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired link"
            });
        }

        // Hash and save password
        user.password = await bcrypt.hash(password, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;

        console.log(`Password updated for ${user.email}`);
        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
