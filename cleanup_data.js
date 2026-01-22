import db from './db.js';

async function cleanupData() {
    try {
        console.log("🧹 Cleaning up invalid data...");

        // 1. Fix NULL or Empty Statuses
        await db.query(`UPDATE tbl_pickup_requests SET status = 'Pending' WHERE status IS NULL OR status = '' OR status = 'Unknown'`);
        console.log("✅ Fixed NULL/Empty statuses to 'Pending'.");

        // 2. Fix 'Cancelled' to 'Rejected' (to align with new strict status)
        await db.query(`UPDATE tbl_pickup_requests SET status = 'Rejected' WHERE status = 'Cancelled'`);
        console.log("✅ Migrated 'Cancelled' status to 'Rejected'.");

        // 3. Ensure valid user_ids (Optional, but good for consistency)
        // await db.query(`DELETE FROM tbl_pickup_requests WHERE user_id NOT IN (SELECT user_id FROM tbl_users)`);

        console.log("Cleanup complete.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    }
}

cleanupData();
