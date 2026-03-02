import express from 'express';
import { sendMessage, getCenterMessages, getAdminMessages, markMessagesRead } from '../controllers/messageController.js';
import { sendUserCenterMessage, getUserCenterMessages } from '../controllers/userCenterMessageController.js';
import { verifyToken } from '../middleware/systemMiddleware.js';

const router = express.Router();

// All message routes require a valid token
router.post('/send', verifyToken, sendMessage);
router.post('/read', verifyToken, markMessagesRead);
router.get('/center/:centerId', verifyToken, getCenterMessages);
router.get('/admin/:centerId', verifyToken, getAdminMessages);

// User-Center Messaging
router.post('/user-center/send', verifyToken, sendUserCenterMessage);
router.get('/user-center/history/:requestId', verifyToken, getUserCenterMessages);

export default router;

