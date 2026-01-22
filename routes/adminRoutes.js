import express from 'express';

const router = express.Router();

import { getDashboardStats, getRecentActivity, getAllUsers, updateUserStatus, getAllActivities } from '../controllers/adminController.js';

router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivity);
router.get('/activities/all', getAllActivities);
router.get('/users', getAllUsers);
router.post('/user-status', updateUserStatus);

export default router;
