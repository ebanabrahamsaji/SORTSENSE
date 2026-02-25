import express from 'express';
import { sendMessage, getCenterMessages, getAdminMessages, markMessagesRead } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/systemMiddleware.js';

const router = express.Router();

// All message routes require a valid token
router.post('/send', verifyToken, sendMessage);
router.post('/read', verifyToken, markMessagesRead);
router.get('/center/:centerId', verifyToken, getCenterMessages);
router.get('/admin/:centerId', verifyToken, getAdminMessages);

export default router;

