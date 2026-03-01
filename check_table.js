
import db from './db.js';

async function checkTable() {
    try {
        const [rows] = await db.query("DESCRIBE tbl_special_waste_requests");
        console.log("tbl_special_waste_requests Structure:");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkTable();
