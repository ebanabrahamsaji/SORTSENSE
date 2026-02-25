import db from './db.js';
import fs from 'fs';

async function check() {
    const [rows] = await db.query("DESCRIBE tbl_center_messages");
    fs.writeFileSync('schema.json', JSON.stringify(rows, null, 2));
    process.exit(0);
}
check();
