import db from './db.js';

async function checkSchema() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM tbl_center_messages");
        console.table(columns);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
