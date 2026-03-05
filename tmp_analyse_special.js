import db from './db.js';

async function analyse() {
    try {
        const [rows] = await db.query("SELECT DISTINCT status FROM tbl_special_waste_requests");
        console.log("Existing statuses in special waste requests:");
        console.log(rows.map(r => r.status));

        const [all] = await db.query("SELECT request_id, status, assignment_status FROM tbl_special_waste_requests");
        console.log("\nAll special waste requests:");
        console.table(all);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

analyse();
