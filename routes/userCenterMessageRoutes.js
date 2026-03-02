import express from 'express';
import { sendUserCenterMessage, getUserCenterMessages } from '../controllers/userCenterMessageController.js';
import { verifyToken } from '../middleware/systemMiddleware.js';

const router = express.Router();

router.post('/send', verifyToken, sendUserCenterMessage);
router.get('/:requestId', verifyToken, getUserCenterMessages);

export default router;
