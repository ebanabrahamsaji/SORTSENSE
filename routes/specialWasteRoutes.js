
import express from 'express';
import multer from 'multer';
import path from 'path';
import { createRequest, getUserRequests, getAllRequests, updateStatus, getCenterRequests, updateRequestDetails } from '../controllers/specialWasteController.js';

const router = express.Router();

// Configure Multer for Waste Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'sw-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/create', upload.single('image'), createRequest);
router.get('/my-requests', getUserRequests);
router.get('/all', getAllRequests);
router.get('/center-requests', getCenterRequests);
router.post('/update-status', updateStatus);
router.post('/update-details', updateRequestDetails);

export default router;
