import express from 'express';
import { getCollectionCenters, getCenterById } from '../controllers/centerController.js';

const router = express.Router();

// Get all centers or filter by ?category_id=X
router.get('/', getCollectionCenters);
router.get('/:id', getCenterById);

export default router;
