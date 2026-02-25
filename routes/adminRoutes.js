import express from 'express';

const router = express.Router();

import {
    getDashboardStats,
    getRecentActivity,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getAllActivities,
    addNewUser,
    addCategory,
    exportReports,
    invalidateSessions,
    getWasteStats,
    addWasteItem,
    updateWasteItem,
    deleteWasteItem,
    deleteCategory,
    getWasteRecords,
    verifyWasteRecord,
    updateWasteRecord,
    deleteWasteRecord,
    deleteActivity,
    getSystemHealthStatus,
    resetCenterSlots,
    toggleCenterStatus,
    exportPickupsCSV,
    getSystemInfo,
    getAdminNotifications,
    markNotificationRead,
    clearNotifications,
    resetRiskScore
} from '../controllers/adminController.js';

router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivity);
router.get('/activities/all', getAllActivities);
router.delete('/activities/:type/:id', deleteActivity);
router.get('/users', getAllUsers);
router.post('/users', addNewUser);
router.post('/user-status', updateUserStatus);
router.post('/user-risk-reset', resetRiskScore);
router.delete('/users/:id', deleteUser);
router.post('/categories', addCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/waste-stats', getWasteStats);
router.post('/waste-items', addWasteItem);
router.put('/waste-items/:id', updateWasteItem);
router.delete('/waste-items/:id', deleteWasteItem);

// Transactional Waste Records
router.get('/waste-records', getWasteRecords);
router.put('/waste-records/:recordId/verify', verifyWasteRecord);
router.put('/waste-records/:recordId', updateWasteRecord);
router.delete('/waste-records/:recordId', deleteWasteRecord);

// System Health & Centers
router.get('/system-health', getSystemHealthStatus);
router.get('/system-info', getSystemInfo); // New endpoint for System Settings
router.post('/centers/:id/reset', resetCenterSlots);
router.post('/centers/:id/toggle', toggleCenterStatus);

router.get('/reports/export', exportReports);
router.get('/export/pickups', exportPickupsCSV);
router.post('/sessions/invalidate', invalidateSessions);

// Admin Notifications
router.get('/notifications', getAdminNotifications);
router.post('/notifications/read', markNotificationRead);
router.delete('/notifications/clear', clearNotifications);

export default router;
