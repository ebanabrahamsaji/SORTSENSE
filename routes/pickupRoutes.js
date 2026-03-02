import express from 'express';
import {
    createPickupRequest, getUserRequests, getCenterRequests, updatePickupStatus, clearCenterHistory,
    getAllPickupRequests, getPickupTrend, getCenterActiveCount,
    deletePickupRequest, addItemToRequest, deleteItemFromRequest
} from '../controllers/pickupController.js';

const router = express.Router();

// Admin / Public Endpoints (match first)
router.get('/all', getAllPickupRequests);
router.get('/trend', getPickupTrend);

// User Endpoints
router.post('/request', createPickupRequest);
router.get('/user/:userId', getUserRequests);

// Center Endpoints
router.get('/center/all', getCenterRequests);          // Full list (location-filtered)
router.get('/center/count', getCenterActiveCount);     // Fast poll — count only
router.delete('/center/history', clearCenterHistory);
router.put('/:requestId/status', updatePickupStatus);

// Management
router.delete('/:requestId', deletePickupRequest);
router.put('/:requestId/add', addItemToRequest);
router.delete('/:requestId/item/:itemId', deleteItemFromRequest);

export default router;
