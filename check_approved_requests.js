
import db from './db.js';

async function checkRequests() {
    try {
        const [rows] = await db.query("SELECT request_id, center_id, status, assignment_status FROM tbl_special_waste_requests WHERE status = 'Approved'");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkRequests();
