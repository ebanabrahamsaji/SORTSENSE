import express from 'express';
import {
    getCollectionCenters, getCenterById, addCenter, deleteCenter, setPrimaryCenter, addCenterUser,
    getCenterNotifications, markCenterNotificationRead, clearCenterNotifications,
    registerCenter, centerLogin
} from '../controllers/centerController.js';

const router = express.Router();

// Get all centers or filter by ?category_id=X
router.get('/', getCollectionCenters);
router.post('/', addCenter);
router.post('/set-primary/:id', setPrimaryCenter);
router.post('/add-user', addCenterUser); // Add new center user account
router.delete('/:id', deleteCenter);

// Auth
router.post('/register', registerCenter);
router.post('/login', centerLogin);
router.post('/auth/login', centerLogin);

// Notifications
router.get('/:id/notifications', getCenterNotifications);
router.post('/:id/notifications/read', markCenterNotificationRead);
router.delete('/:id/notifications/clear', clearCenterNotifications);

router.get('/:id', getCenterById);

export default router;
