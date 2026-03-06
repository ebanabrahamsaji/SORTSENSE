import express from 'express';
import { getProfile } from '../controllers/authController.js';
import { getNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications, getUserHistory, clearUserHistory, getUserStats, getUserRewards } from '../controllers/userController.js';

// ... other imports
import { getUserScanHistory } from '../controllers/historyController.js';
import { downloadUserReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/profile', getProfile);
router.get('/scan-history', getUserScanHistory);

// Specific Data Endpoints (to avoid parametric collision)
router.get('/rewards/v1/:userId', getUserRewards);
router.get('/reports/v1/:userId', getUserHistory); // Reusing history as the report list
router.get('/notifications/v1/:userId', getNotifications);
router.delete('/notifications/v1/:userId/clear-all', clearAllNotifications);
router.put('/notifications/v1/:userId/read-all', markAllNotificationsRead);
router.get('/report/download/:reportId', downloadUserReport);

// History Routes
router.get('/history', getUserHistory);
router.get('/:userId/history', getUserHistory);

// Other Parametric Routes
router.get('/:userId/stats', getUserStats);
router.delete('/:userId/history', clearUserHistory);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
