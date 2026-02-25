import db from './db.js';

async function listTables() {
    try {
        const [tables] = await db.query('SHOW TABLES');
        console.log(JSON.stringify(tables, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listTables();
