
import db from './db.js';

const runUpdate = async () => {
    try {
        console.log("Starting Schema Update...");

        // 1. Modify Status ENUM
        await db.query(`
            ALTER TABLE tbl_pickup_requests 
            MODIFY COLUMN status ENUM(
                'Pending', 
                'Aggregation_Pending',
                'Ready_For_Dispatch', 
                'Scheduled', 
                'In_Transit', 
                'Completed', 
                'Auto_Rescheduled',
                'Cancelled'
            ) DEFAULT 'Aggregation_Pending';
        `);
        console.log("✅ Modified Status ENUM");

        // 2. Add Columns (Check if exist first or just try-catch)
        // Since ALTER TABLE ADD COLUMN errors if exists, we can wrap in try-catch or just run it.
        // Or cleaner: Use direct ADD COLUMN. If it fails, it usually means it exists.
        try {
            await db.query(`
                ALTER TABLE tbl_pickup_requests
                ADD COLUMN priority_score INT DEFAULT 0,
                ADD COLUMN scheduled_at TIMESTAMP NULL,
                ADD COLUMN notes TEXT;
            `);
            console.log("✅ Added new columns");
        } catch (e) {
            console.log("⚠️ Columns might already exist or error:", e.message);
        }

        // 3. Update Status
        await db.query("UPDATE tbl_pickup_requests SET status = 'Aggregation_Pending' WHERE status = 'Pending'");
        console.log("✅ Updated existing 'Pending' to 'Aggregation_Pending'");

        console.log("🎉 Schema Update Complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Schema Update Failed:", error);
        process.exit(1);
    }
};

runUpdate();
