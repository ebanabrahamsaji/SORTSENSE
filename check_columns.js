import db from './db.js';

async function checkColumns() {
    try {
        console.log("Checking columns for tbl_pickup_requests...");
        const [columns] = await db.query("SHOW COLUMNS FROM tbl_pickup_requests");
        console.log("Columns:", columns.map(c => c.Field).join(', '));
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

checkColumns();
