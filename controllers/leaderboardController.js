
import db from '../db.js';

// 1. Get Leaderboard (Top 20) with Filtering
export const getLeaderboard = async (req, res) => {
    const { period } = req.query; // weekly, monthly, alltime

    try {
        let orderBy = "monthly_points";
        if (period === 'alltime') orderBy = "green_score";
        // Note: For weekly, we'd ideally have a weekly_points column, 
        // but for now we'll use monthly as a reasonable proxy or fallback.

        const query = `
            SELECT user_id, name, monthly_points, green_score
            FROM tbl_users
            ORDER BY ${orderBy} DESC
            LIMIT 20
        `;
        const [users] = await db.query(query);

        // Add Rank
        const rankedUsers = users.map((u, index) => ({
            rank: index + 1,
            ...u
        }));

        res.json(rankedUsers);
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
};

// 2. Get User Challenges & Progress
export const getUserChallenges = async (req, res) => {
    const { userId } = req.params;

    try {
        // Ensure all active challenges exist for user
        const activeChallengesQuery = "SELECT * FROM tbl_challenges WHERE active = TRUE";
        const [challenges] = await db.query(activeChallengesQuery);

        for (const challenge of challenges) {
            // Check if user has this challenge tracked
            const [exists] = await db.query(
                "SELECT * FROM tbl_user_challenges WHERE user_id = ? AND challenge_id = ?",
                [userId, challenge.challenge_id]
            );

            if (exists.length === 0) {
                // Initialize progress
                await db.query(
                    "INSERT INTO tbl_user_challenges (user_id, challenge_id, progress, completed) VALUES (?, ?, 0, FALSE)",
                    [userId, challenge.challenge_id]
                );
            }
        }

        // Fetch Progress
        const progressQuery = `
            SELECT uc.*, c.title, c.description, c.target, c.reward_points, c.type
            FROM tbl_user_challenges uc
            JOIN tbl_challenges c ON uc.challenge_id = c.challenge_id
            WHERE uc.user_id = ?
        `;
        const [userProgress] = await db.query(progressQuery, [userId]);

        res.json(userProgress);
    } catch (error) {
        console.error("Challenge Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch challenges" });
    }
};

// 3. Update Progress (Internal Helper)
export const updateChallengeProgress = async (userId, type) => {
    try {
        // Find incomplete challenges of this type
        const findQuery = `
            SELECT uc.user_challenge_id, uc.progress, uc.completed, c.target, c.reward_points
            FROM tbl_user_challenges uc
            JOIN tbl_challenges c ON uc.challenge_id = c.challenge_id
            WHERE uc.user_id = ? AND c.type = ? AND uc.completed = FALSE
        `;
        const [challenges] = await db.query(findQuery, [userId, type]);

        for (const ch of challenges) {
            const newProgress = ch.progress + 1;
            let completed = false;

            if (newProgress >= ch.target) {
                completed = true;
                // Reward Points
                await db.query(
                    "UPDATE tbl_users SET green_score = green_score + ?, monthly_points = monthly_points + ? WHERE user_id = ?",
                    [ch.reward_points, ch.reward_points, userId]
                );

                // Notify User
                await db.query(
                    "INSERT INTO tbl_notifications (user_id, title, message, type) VALUES (?, ?, ?, 'SUCCESS')",
                    [userId, 'Challenge Completed! 🏆', `You earned ${ch.reward_points} pts for completing a challenge!`]
                );
            }

            // Update Progress
            await db.query(
                "UPDATE tbl_user_challenges SET progress = ?, completed = ? WHERE user_challenge_id = ?",
                [newProgress, completed, ch.user_challenge_id]
            );
        }
    } catch (error) {
        console.error("Progress Update Error:", error);
    }
};

// 4. Monthly Reset
export const resetMonthlyLeaderboard = async () => {
    try {
        console.log("🔄 Resetting Monthly Leaderboard...");
        await db.query("UPDATE tbl_users SET monthly_points = 0");
        console.log("✅ Monthly Leaderboard Reset Complete.");
    } catch (error) {
        console.error("❌ Reset Error:", error);
    }
};
