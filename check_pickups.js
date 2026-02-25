
import db from './db.js';

async function checkPickups() {
    try {
        const [rows] = await db.query("SELECT center_id, center_name, (SELECT COUNT(*) FROM tbl_pickup_requests WHERE center_id = c.center_id) as count FROM tbl_collection_centers c WHERE center_name LIKE '%HKS%';");
        console.log(JSON.stringify(rows));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

checkPickups();
