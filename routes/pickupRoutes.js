import express from 'express';
import { createPickupRequest, getUserRequests, getCenterRequests, updatePickupStatus, clearCenterHistory } from '../controllers/pickupController.js';

const router = express.Router();

// User Endpoints
router.post('/request', createPickupRequest);
router.get('/user/:userId', getUserRequests);

// Center Endpoints
router.get('/center/all', getCenterRequests); // In real app, secured by center login
router.delete('/center/history', clearCenterHistory); // Bulk clear history
router.put('/:requestId/status', updatePickupStatus);

// New Features (Delete & Add Item)
import { deletePickupRequest, addItemToRequest } from '../controllers/pickupController.js';
router.delete('/:requestId', deletePickupRequest);
router.put('/:requestId/add', addItemToRequest);
import { deleteItemFromRequest } from '../controllers/pickupController.js';
router.delete('/:requestId/item/:itemId', deleteItemFromRequest);

import { getAllPickupRequests, getPickupTrend } from '../controllers/pickupController.js';
router.get('/all', getAllPickupRequests);
router.get('/trend', getPickupTrend); // New Endpoint

export default router;
