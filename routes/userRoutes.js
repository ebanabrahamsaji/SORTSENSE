import express from 'express';
import { getProfile } from '../controllers/authController.js';
import { getNotifications, markNotificationRead, getUserHistory, clearUserHistory } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', getProfile);
router.get('/:userId/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/:userId/history', getUserHistory);
router.delete('/:userId/history', clearUserHistory);

export default router;
