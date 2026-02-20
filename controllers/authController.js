import bcrypt from 'bcrypt';
import db from '../db.js';
import { transporter } from '../email.js';

// Register User
export const registerUser = async (req, res) => {
    const { name, email, password, language_pref } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        // Check if user exists
        const [existing] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert User
        const [result] = await db.query(
            'INSERT INTO tbl_users (name, email, password_hash, language_pref) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, language_pref || 'ENGLISH']
        );

        // Send Welcome Email
        try {
            await transporter.sendMail({
                from: `"SortSense Support" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Welcome to SortSense!',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #10B981;">Welcome to SortSense!</h2>
                        <p>Hi ${name},</p>
                        <p>You have successfully registered to SortSense.</p>
                        <p>Start your eco-friendly journey with us today!</p>
                        <br>
                        <p>Best regards,</p>
                        <p><strong>SortSense Team</strong></p>
                    </div>
                `
            });
            console.log(`✅ Welcome email sent to ${email}`);
        } catch (emailErr) {
            console.error("❌ Failed to send welcome email:", emailErr);
        }

        res.status(201).json({ message: 'User registered successfully.', userId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// Login User
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        console.log("Login Attempt:", { email }); // DEBUG (don't log password)

        // Allow login via Email OR Name (Username)
        const [users] = await db.query(
            'SELECT * FROM tbl_users WHERE email = ? OR name = ?',
            [email, email]
        );
        console.log("Login Query Found:", users.length, "users"); // DEBUG

        if (users.length === 0) {
            return res.status(401).json({ message: 'No account found with that email.' });
        }

        const user = users[0];

        // If no password hash (Google-only account), direct them to Google Sign-In
        if (!user.password_hash) {
            return res.status(401).json({ message: 'This account uses Google Sign-In. Please click "Sign in with Google".' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            // If user has a profile_picture, they likely registered via Google Sign-In.
            // Their password_hash is a dummy value that won't match anything.
            const isGoogleAccount = !!user.profile_picture;
            return res.status(401).json({
                message: isGoogleAccount
                    ? 'This account was created with Google Sign-In. Please click "Sign in with Google" button above.'
                    : 'Incorrect password. Please try again or use "Forgot password?".'
            });
        }

        // Return user info (omit password)
        const { password_hash, ...userInfo } = user;

        // Ensure role exists in response
        if (!userInfo.role) userInfo.role = 'USER';

        res.json({ message: 'Login successful.', user: userInfo });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// Google Login (Check Access + Create/Login)
export const googleLogin = async (req, res) => {
    const { email, name, picture } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);

        if (users.length > 0) {
            // User Exists
            const user = users[0];
            const role = user.role || 'USER';

            if (role === 'ADMIN' || role === 'CENTER') {
                return res.status(403).json({ message: 'Google Login is disabled for Admin/Center accounts. Please use Password.' });
            }

            // Return user details (like loginUser)
            const { password_hash, ...userInfo } = user;
            return res.json({ message: 'Google Login successful.', user: userInfo });

        } else {
            // New User - Auto Register
            // Note: password_hash cannot be null usually, so we set a dummy non-matchable hash or handle it.
            // We'll set a random string as hash that bcrypt won't match easily (or proper hash).
            const dummyHash = await bcrypt.hash(email + Date.now(), 10); // Unusable password

            const [result] = await db.query(
                'INSERT INTO tbl_users (name, email, password_hash, role, profile_picture) VALUES (?, ?, ?, ?, ?)',
                [name || 'Google User', email, dummyHash, 'USER', picture || null]
            );

            // Send Welcome Email
            try {
                await transporter.sendMail({
                    from: `"SortSense Support" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Welcome to SortSense!',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #10B981;">Welcome to SortSense!</h2>
                            <p>Hi ${name || 'User'},</p>
                            <p>You have successfully registered to SortSense.</p>
                            <p>Start your eco-friendly journey with us today!</p>
                            <br>
                            <p>Best regards,</p>
                            <p><strong>SortSense Team</strong></p>
                        </div>
                    `
                });
                console.log(`✅ Welcome email sent to ${email}`);
            } catch (emailErr) {
                console.error("❌ Failed to send welcome email:", emailErr);
            }

            const newUser = {
                user_id: result.insertId,
                name: name || 'Google User',
                email: email,
                role: 'USER',
                profile_picture: picture
            };

            return res.status(201).json({ message: 'Google Registration successful.', user: newUser });
        }

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ message: 'Server error during Google login.' });
    }
};
// Forgot Password
export const forgotPassword = async (req, res) => {
    // Trim email to avoid whitespace issues
    const email = req.body.email ? req.body.email.trim() : '';

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Email address not found.' });
        }

        const user = users[0];
        const role = user.role || 'USER';

        if (role === 'ADMIN' || role === 'CENTER') {
            return res.status(403).json({
                message: 'Password reset is disabled for Admin/Center accounts. Please contact system support.'
            });
        }

        // Generate token with separator for reliable parsing
        // Format: email:timestamp
        const rawToken = `${email}:${Date.now()}`;
        const token = Buffer.from(rawToken).toString('base64');

        const resetLink = `http://localhost:8000/pages/reset-password.html?token=${encodeURIComponent(token)}`;

        // Send Email via Nodemailer
        try {
            await transporter.verify(); // Verify connection before sending

            await transporter.sendMail({
                from: `"SortSense Support" <${process.env.EMAIL_USER}>`, // Sender address
                to: email, // Recipient address
                subject: 'SortSense - Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #10B981;">Reset Your Password</h2>
                        <p>You requested a password reset for your SortSense account.</p>
                        <p>Click the button below to reset it:</p>
                        <a href="${resetLink}" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p><a href="${resetLink}">${resetLink}</a></p>
                        <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
                    </div>
                `
            });
            console.log(`✅ Password reset email sent to ${email}`);

            // Only send success response if email sends successfully
            return res.json({ message: 'Reset link sent to your email.' });

        } catch (mailError) {
            console.error("❌ Failed to send email:", mailError);
            console.log("🔐 RESET LINK (Fallback):", resetLink);

            // Return error response if email fails
            return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error request.' });
    }
};
// Reset Password
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Missing token or password.' });
    }

    try {
        // Decode token
        // Token Format: base64(email:timestamp)
        const decoded = Buffer.from(token, 'base64').toString('utf-8');

        // Split by the last colon to separate email and timestamp
        const lastColonIndex = decoded.lastIndexOf(':');

        if (lastColonIndex === -1) {
            return res.status(400).json({ message: 'Invalid token format.' });
        }

        const email = decoded.substring(0, lastColonIndex);
        const timestamp = decoded.substring(lastColonIndex + 1);

        // Validate Timestamp (e.g. 1 hour expiry)
        const diff = Date.now() - parseInt(timestamp);

        // Ensure timestamp is a valid number
        if (isNaN(parseInt(timestamp)) || isNaN(diff) || diff > 3600000) { // 1 hour
            return res.status(400).json({ message: 'Token expired.' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email in token.' });
        }

        // Hash new password
        const password_hash = await bcrypt.hash(password, 10);

        // Update DB
        const [result] = await db.query(
            'UPDATE tbl_users SET password_hash = ? WHERE email = ?',
            [password_hash, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ message: 'Password updated successfully.' });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Failed to reset password.' });
    }
};

// Update Language Preference
export const updateLanguage = async (req, res) => {
    const { email, language } = req.body;

    if (!email || !language) {
        return res.status(400).json({ message: 'Email and language are required.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE tbl_users SET language_pref = ? WHERE email = ?',
            [language, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ message: 'Language updated successfully.' });
    } catch (error) {
        console.error("Update Language Error:", error);
        res.status(500).json({ message: 'Failed to update language.' });
    }
};

// Upload Avatar Handler
export const uploadAvatar = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Return relative URL
    // Assuming uploads is served statically
    const url = `../uploads/${req.file.filename}`;
    // Fix: We should check how static files are served. server.js has `app.use(express.static(__dirname));`
    // So 'http://localhost:8000/uploads/foo.jpg' works.
    // The link should be '/uploads/filename'.
    const publicUrl = `/uploads/${req.file.filename}`;
    res.json({ message: 'Avatar uploaded successfully', url: publicUrl });
};

// Update Profile Handler
export const updateProfile = async (req, res) => {
    const { email, fullname, phone, city, state, zip, country, profilePicture } = req.body;

    console.log("updateProfile Request Body:", req.body); // DEBUG LOG

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        await db.query(
            `UPDATE tbl_users SET 
                name = ?, phone = ?, city = ?, state = ?, zip = ?, country = ?, profile_picture = ?
             WHERE email = ?`,
            [fullname, phone, city, state, zip, country, profilePicture, email]
        );

        const [users] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const { password_hash, ...userInfo } = user;

        res.json({ message: 'Profile updated successfully', user: userInfo });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
};

// Get Profile Handler
export const getProfile = async (req, res) => {
    const { email, userId } = req.query;

    if (!email && !userId) {
        return res.status(400).json({ message: 'User ID or Email is required.' });
    }

    try {
        let query = 'SELECT * FROM tbl_users WHERE ';
        let param = '';

        if (userId) {
            query += 'user_id = ?';
            param = userId;
        } else {
            query += 'email = ?';
            param = email;
        }

        const [users] = await db.query(query, [param]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const { password_hash, ...userInfo } = users[0];

        res.json({ user: userInfo });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Failed to fetch profile.' });
    }
};

// Change Password (Authenticated)
export const changePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // 1. Get User
        const [users] = await db.query('SELECT * FROM tbl_users WHERE user_id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found.' });

        const user = users[0];

        // 2. Verify Old Password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        // 3. Hash New Password
        const newHash = await bcrypt.hash(newPassword, 10);

        // 4. Update
        await db.query('UPDATE tbl_users SET password_hash = ? WHERE user_id = ?', [newHash, userId]);

        res.json({ message: 'Password changed successfully.' });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: 'Error changing password.' });
    }
};
