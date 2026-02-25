
import db from './db.js';

async function checkCenters() {
    try {
        const [rows] = await db.query("SELECT center_id, center_name, username FROM tbl_collection_centers WHERE center_name LIKE '%HKS%';");
        console.log(JSON.stringify(rows));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

checkCenters();
