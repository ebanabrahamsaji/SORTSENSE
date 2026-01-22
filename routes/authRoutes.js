import express from 'express';
import multer from 'multer';
import path from 'path';
import { registerUser, loginUser, googleLogin, forgotPassword, resetPassword, updateLanguage, uploadAvatar, updateProfile, getProfile, changePassword } from '../controllers/authController.js';

const router = express.Router();

// ... existing setup ...
// Configure Multer for Avatars
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const avatarUpload = multer({ storage: storage });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/update-language', updateLanguage);

// New Profile Routes
router.post('/upload-avatar', avatarUpload.single('avatar'), uploadAvatar);
router.post('/update-profile', updateProfile);
router.get('/profile', getProfile);
router.post('/change-password', changePassword);

export default router;
