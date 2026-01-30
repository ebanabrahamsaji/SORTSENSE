import express from 'express';

const router = express.Router();

import {
    getDashboardStats,
    getRecentActivity,
    getAllUsers,
    updateUserStatus,
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
    deleteActivity
} from '../controllers/adminController.js';

router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivity);
router.get('/activities/all', getAllActivities);
router.delete('/activities/:type/:id', deleteActivity);
router.get('/users', getAllUsers);
router.post('/users', addNewUser);
router.post('/user-status', updateUserStatus);
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

router.get('/reports/export', exportReports);
router.post('/sessions/invalidate', invalidateSessions);

export default router;
