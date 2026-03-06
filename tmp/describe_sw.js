import db from '../db.js';
async function run() {
    const [rows] = await db.query('DESCRIBE tbl_special_waste_requests');
    console.log(rows.map(r => r.Field).join(', '));
    process.exit();
}
run();
