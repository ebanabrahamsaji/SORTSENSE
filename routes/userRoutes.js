import express from 'express';
import { getProfile } from '../controllers/authController.js';
import { getNotifications, markNotificationRead, getUserHistory, clearUserHistory, getUserStats, getUserRewards } from '../controllers/userController.js';
import { getUserScanHistory } from '../controllers/historyController.js';
import { downloadUserReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/profile', getProfile);
router.get('/scan-history', getUserScanHistory);

// Specific Data Endpoints (to avoid parametric collision)
router.get('/rewards/v1/:userId', getUserRewards);
router.get('/reports/v1/:userId', getUserHistory); // Reusing history as the report list
router.get('/notifications/v1/:userId', getNotifications);
router.get('/report/download/:reportId', downloadUserReport);

// Other Parametric Routes
router.get('/:userId/stats', getUserStats);
router.delete('/:userId/history', clearUserHistory);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
