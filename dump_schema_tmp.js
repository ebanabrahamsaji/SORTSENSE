import db from './db.js';
import fs from 'fs';

async function dumpSchema() {
    try {
        const [rows] = await db.query('SHOW CREATE TABLE tbl_user_center_messages');
        fs.writeFileSync('tmp_schema_dump.txt', rows[0]['Create Table']);
        console.log("Schema dumped to tmp_schema_dump.txt");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
dumpSchema();
