
import express from 'express';
import { getUserScanHistory } from '../controllers/historyController.js';
// import { verifyToken } from '../middleware/authMiddleware.js'; // Assuming auth middleware exists

const router = express.Router();

// Allow query param for flexibility, but ideally use verified token
router.get('/scan-history', getUserScanHistory);

export default router;
