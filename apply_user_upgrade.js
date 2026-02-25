
import db from './db.js';
import fs from 'fs';

async function applyMigration() {
    try {
        console.log("Applying User Management Upgrade...");
        const sql = fs.readFileSync('upgrade_user_management.sql', 'utf8');
        const queries = sql.split(';').filter(q => q.trim() !== '');

        for (let query of queries) {
            console.log("Running:", query.trim().split('\n')[0] + "...");
            await db.query(query);
        }

        console.log("✅ User Management Upgrade applied successfully");
        process.exit(0);
    } catch (e) {
        console.error("❌ Migration failed:", e);
        process.exit(1);
    }
}

applyMigration();
