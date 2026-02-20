import express from 'express';
import { getLeaderboard, getUserChallenges, resetMonthlyLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/challenges/:userId', getUserChallenges);
router.post('/reset-monthly', async (req, res) => {
    await resetMonthlyLeaderboard();
    res.json({ message: "Monthly leaderboard reset triggered." });
});

export default router;
