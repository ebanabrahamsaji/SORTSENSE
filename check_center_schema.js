import db from './db.js';
async function check() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM tbl_collection_centers");
        const cols = rows.map(r => r.Field).join(', ');
        console.log("COLUMNS_START");
        console.log(cols);
        console.log("COLUMNS_END");
    } catch (err) {
        console.error(err);
    }
    process.exit();
}
check();
