import db from './db.js';

async function check() {
    try {
        const [rows] = await db.query("SHOW CREATE TABLE tbl_center_messages");
        const createSql = rows[0]['Create Table'];
        const lines = createSql.split('\n');
        let count = 0;
        for (const line of lines) {
            if (line.includes('CONSTRAINT')) {
                count++;
                console.log(`C${count}: ${line.trim()}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
