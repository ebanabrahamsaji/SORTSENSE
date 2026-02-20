import express from 'express';
import {
    getMarketplaceItems,
    createMarketplaceItem,
    validateMarketplaceItem,
    markInterested,
    deleteMarketplaceItem
} from '../controllers/marketplaceController.js';

const router = express.Router();

router.get('/', getMarketplaceItems);
router.post('/', validateMarketplaceItem, createMarketplaceItem);
router.post('/interested', markInterested);
router.delete('/:id', deleteMarketplaceItem);

/* Messaging Routes */
import { sendMessage, getMessages, replyMessage } from '../controllers/marketplaceController.js';
router.post('/contact', sendMessage); // Send new message to seller
router.get('/messages/:userId', getMessages); // Get inbox
router.post('/reply', replyMessage); // Reply to a message

export default router;
