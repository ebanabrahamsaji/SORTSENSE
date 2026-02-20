import express from 'express';
import { getCollectionCenters, getCenterById, addCenter, deleteCenter, setPrimaryCenter, addCenterUser } from '../controllers/centerController.js';

const router = express.Router();

// Get all centers or filter by ?category_id=X
router.get('/', getCollectionCenters);
router.post('/', addCenter);
router.post('/set-primary/:id', setPrimaryCenter);
router.post('/add-user', addCenterUser); // Add new center user account
router.delete('/:id', deleteCenter);
router.get('/:id', getCenterById);

export default router;
