import db from '../db.js';

/**
 * Reward logic enhancements 
 * - Eco Points Utility
 * - Quest Reward Logic
 * - Achievement Rewards
 * - Leaderboard Rewards
 * - Recycling Impact Rewards
 * - Level Benefits
 * - Notifications
 */

export const LEVEL_THRESHOLDS = 2000;

export const getLevel = (points) => Math.floor((points || 0) / LEVEL_THRESHOLDS) + 1;

export const getLevelMultiplier = (level) => {
    // Level 1-2: 1.0x, Level 3-4: 1.1x, Level 5+: 1.25x
    if (level >= 5) return 1.25;
    if (level >= 3) return 1.1;
    return 1.0;
};

// 1. Eco Points utility (Calculate discounts, priority, etc based on points/level)
export const calculateMarketplaceDiscount = (points) => {
    const level = getLevel(points);
    if (level >= 10) return 0.20; // 20% discount
    if (level >= 5) return 0.10; // 10% discount
    if (level >= 3) return 0.05; // 5% discount
    return 0;
};

// 7. Reward Notifications (Internal helper)
const createNotification = async (userId, title, message) => {
    await db.query(`
        INSERT INTO tbl_notifications (user_id, title, message, type)
        VALUES (?, ?, ?, 'REWARD')
    `, [userId, title, message]);
};

// 5. Recycling Impact Rewards (Automatically converted from kg)
export const processRecyclingImpact = async (userId, weightKg) => {
    try {
        let bonusPoints = 0;
        if (weightKg >= 50) bonusPoints = 300;
        else if (weightKg >= 25) bonusPoints = 120;
        else if (weightKg >= 10) bonusPoints = 50;
        else bonusPoints = Math.floor(weightKg * 2); // Base points

        if (bonusPoints > 0) {
            await awardPoints(userId, bonusPoints, `Recycling Impact (${weightKg}kg)`);
        }
    } catch (err) {
        console.error("Recycling Impact Error:", err);
    }
};

// Core Award Points Logic
export const awardPoints = async (userId, basePoints, reason) => {
    try {
        const [userRaw] = await db.query("SELECT eco_credits, green_score FROM tbl_users WHERE user_id = ?", [userId]);
        if (userRaw.length === 0) return;
        const currentPoints = userRaw[0].eco_credits || userRaw[0].green_score || 0;

        // 6. Level Benefits (Multiplier)
        const currentLevel = getLevel(currentPoints);
        const multiplier = getLevelMultiplier(currentLevel);
        const finalPoints = Math.floor(basePoints * multiplier);

        await db.query(`
            UPDATE tbl_users 
            SET green_score = green_score + ?, eco_credits = eco_credits + ?, monthly_points = monthly_points + ? 
            WHERE user_id = ?
        `, [finalPoints, finalPoints, finalPoints, userId]);

        if (reason) {
            await createNotification(userId, 'Eco Points Earned! 🌿', `You earned ${finalPoints} Eco Points for ${reason}.`);
        }

        return finalPoints;
    } catch (err) {
        console.error("Award Points Error:", err);
    }
};

// 3. Achievement Rewards
export const processAchievementUnlock = async (userId, achievementName) => {
    const rewards = {
        'First Steps': 50,
        'Recycling Pro': 150,
        'Streak Master': 200,
        'Eco Legend': 500
    };
    const pts = rewards[achievementName];
    if (pts) {
        await awardPoints(userId, pts, `unlocking achievement: ${achievementName}`);
    }
};

// 2. Quest Reward Logic (Overrides standard target progress)
export const processQuestCompletion = async (userId, questName) => {
    const rewards = {
        'Daily Sort': 50,
        'Heavy Lifter': 100,
        'Market Mover': 75
    };
    const pts = rewards[questName] || 25; // Default mapped rewards
    await awardPoints(userId, pts, `completing Daily Quest: ${questName}`);
};

// 4. Leaderboard Rewards (Weekly Job)
export const grantWeeklyLeaderboardRewards = async () => {
    try {
        console.log("🏆 Running Weekly Leaderboard Rewards...");
        const [topUsers] = await db.query(`
            SELECT user_id, monthly_points 
            FROM tbl_users 
            ORDER BY monthly_points DESC LIMIT 3
        `);

        const rewards = [500, 300, 150];

        for (let i = 0; i < topUsers.length; i++) {
            const user = topUsers[i];
            const pts = rewards[i];
            if (pts) {
                await awardPoints(user.user_id, pts, `ranking #${i + 1} on the weekly leaderboard`);
            }
        }

        // Optionally reset weekly points if implemented
    } catch (err) {
        console.error("Weekly Leaderboard Reward Error:", err);
    }
};
