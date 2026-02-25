import db from './db.js';
import fs from 'fs';

async function listAllTables() {
    try {
        const [rows] = await db.query("SHOW TABLES");
        const tables = rows.map(r => Object.values(r)[0]);
        fs.writeFileSync('all_tables.json', JSON.stringify(tables, null, 2));

        const schema = {};
        for (const table of tables) {
            const [cols] = await db.query(`SHOW COLUMNS FROM ${table}`);
            schema[table] = cols.map(c => c.Field);
        }
        fs.writeFileSync('full_schema.json', JSON.stringify(schema, null, 2));
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
listAllTables();
