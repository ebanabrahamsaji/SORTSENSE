import db from './db.js';
import fs from 'fs';
import path from 'path';

async function applySchema() {
    try {
        const sqlPath = './setup_marketplace.sql';
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon but handle potential issues with triggers/functions if they existed
        const statements = sql.split(';').filter(s => s.trim() !== '');

        console.log("🚀 Applying Marketplace Schema...");

        for (let statement of statements) {
            await db.query(statement);
        }

        console.log("✅ Marketplace Schema Applied Successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Error:", err);
        process.exit(1);
    }
}

applySchema();
