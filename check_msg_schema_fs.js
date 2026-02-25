import db from './db.js';
import fs from 'fs';

async function checkSchema() {
    try {
        const [columns] = await db.query('DESCRIBE center_messages');
        fs.writeFileSync('schema_info.json', JSON.stringify(columns, null, 2));
        console.log('Schema written to schema_info.json');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSchema();
