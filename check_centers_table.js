
import db from './db.js';

async function checkCenters() {
    try {
        const [rows] = await db.query("DESCRIBE tbl_collection_centers");
        console.log("tbl_collection_centers Structure:");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkCenters();
