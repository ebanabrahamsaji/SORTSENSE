
import db from './db.js';

async function listCenters() {
    try {
        const [rows] = await db.query("SELECT center_id, center_name, is_primary, type FROM tbl_collection_centers");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

listCenters();
