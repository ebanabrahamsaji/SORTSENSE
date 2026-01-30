
import db from './db.js';

async function checkTable() {
    try {
        const [rows] = await db.query("DESCRIBE tbl_user_history");
        console.log(rows.map(r => r.Field));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkTable();
