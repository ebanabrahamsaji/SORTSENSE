import db from '../db.js';
async function run() {
    const [rows] = await db.query('SELECT center_id, username FROM tbl_collection_centers WHERE username = "hkskanjirapally"');
    console.log(rows);
    process.exit();
}
run();
