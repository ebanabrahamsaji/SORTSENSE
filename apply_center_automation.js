import db from './db.js';
import fs from 'fs';

async function applyMigration() {
    try {
        const sql = fs.readFileSync('center_automation_schema.sql', 'utf8');
        const queries = sql.split(';').filter(q => q.trim() !== '');

        for (let query of queries) {
            console.log("Running:", query.trim().split('\n')[0] + "...");
            await db.query(query);
        }

        console.log("✅ Center Automation Migration applied successfully");
        process.exit(0);
    } catch (e) {
        console.error("❌ Migration failed:", e.message);
        process.exit(1);
    }
}

applyMigration();
