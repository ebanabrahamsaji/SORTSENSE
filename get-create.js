import db from './db.js';
import fs from 'fs';

async function check() {
    const [rows] = await db.query("SHOW CREATE TABLE tbl_center_messages");
    fs.writeFileSync('create_table.sql', rows[0]['Create Table']);
    process.exit(0);
}
check();
