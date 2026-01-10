import express from 'express';
import { getCollectionCenters } from '../controllers/centerController.js';

const router = express.Router();

// Get all centers or filter by ?category_id=X
router.get('/', getCollectionCenters);

export default router;
