import db from './db.js';
async function check() {
    try {
        const [rows] = await db.query("DESC tbl_special_waste_requests");
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
check();
