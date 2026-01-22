
import db from './db.js';

const revertData = async () => {
    try {
        console.log("🔄 Reverting Data Statuses...");

        // Revert aggregation statuses back to Pending
        const [result] = await db.query(`
            UPDATE tbl_pickup_requests 
            SET status = 'Pending' 
            WHERE status IN ('Aggregation_Pending', 'Ready_For_Dispatch', 'Scheduled', 'Auto_Rescheduled')
        `);

        console.log(`✅ Updated ${result.affectedRows} requests back to 'Pending'.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Revert Failed:", error);
        process.exit(1);
    }
};

revertData();
