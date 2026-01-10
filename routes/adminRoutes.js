import express from 'express';

const router = express.Router();

// Mock Stats
router.get('/stats', (req, res) => {
    res.json({
        totalUsers: 1250,
        itemsSorted: 5430,
        flaggedItems: 12,
        systemUptime: "99.9%"
    });
});

// Mock Activities
router.get('/activities', (req, res) => {
    res.json([
        { user: "John Doe", action: "Scanned Plastic Bottle", time: "2 mins ago", status: "verified", statusLabel: "Verified" },
        { user: "Sarah Smith", action: "Scanned Glass Jar", time: "15 mins ago", status: "pending", statusLabel: "Pending" },
        { user: "Mike Ross", action: "Updated Profile", time: "1 hour ago", status: "completed", statusLabel: "Completed" },
        { user: "Emma Wilson", action: "Reported Issue", time: "3 hours ago", status: "pending", statusLabel: "Review" }
    ]);
});

export default router;
