
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
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

import { verifyToken } from '../middleware/systemMiddleware.js';

router.post('/create', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, createRequest);
router.get('/my-requests', getUserRequests);
router.get('/all', verifyToken, getAllRequests);
router.get('/center-requests', verifyToken, getCenterRequests);
router.post('/update-status', updateStatus);
router.post('/update-details', updateRequestDetails);

import { deleteRequest } from '../controllers/specialWasteController.js';
router.delete('/:id', deleteRequest);

export default router;
