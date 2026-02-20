
import fs from 'fs';
import path from 'path';
import db from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applySchema() {
    try {
        console.log("Applying Leaderboard Schema...");
        const sqlPath = path.join(__dirname, 'setup_leaderboard.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split multiple queries by semicolon (basic splitting)
        const queries = sql.split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (const query of queries) {
            console.log(`Executing: ${query.substring(0, 50)}...`);
            try {
                await db.query(query);
            } catch (err) {
                // Ignore "Duplicate column" or "Table already exists" errors gracefully
                if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`Skipping (Already exists): ${err.sqlMessage}`);
                } else if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`Skipping (Duplicate entry): ${err.sqlMessage}`);
                } else {
                    console.error(`Error executing query: ${err.message}`);
                }
            }
        }

        console.log("✅ Leaderboard Schema Applied Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Schema Application Failed:", error);
        process.exit(1);
    }
}

applySchema();
