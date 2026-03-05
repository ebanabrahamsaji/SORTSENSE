import db from './db.js';

async function verifyCenters() {
    try {
        console.log("Checking available centers for testing...");
        const [rows] = await db.query("SELECT center_id, center_name, location, status, available_slots FROM tbl_collection_centers WHERE status = 'OPEN' AND available_slots > 0");
        console.table(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verifyCenters();
