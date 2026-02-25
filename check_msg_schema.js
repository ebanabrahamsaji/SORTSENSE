import db from './db.js';

async function checkSchema() {
    try {
        const [columns] = await db.query('DESCRIBE center_messages');
        console.log(JSON.stringify(columns, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSchema();
