import db from '../db.js';
async function run() {
    await db.query('UPDATE tbl_special_waste_requests SET status = "Completed" WHERE center_id = 699 LIMIT 1');
    process.exit();
}
run();
