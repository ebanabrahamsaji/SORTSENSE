import db from './db.js';

async function check() {
    try {
        const [rows] = await db.query("SHOW CREATE TABLE tbl_center_messages");
        console.log(rows[0]['Create Table']);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
