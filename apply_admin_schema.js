
import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runUpdate = async () => {
    try {
        console.log("Starting Admin Schema Update...");

        const sqlPath = path.join(__dirname, 'admin_schema_update.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split functionality into individual statements if needed, or execute as one if supported (MySQL2 usually needs multipleStatements: true)
        // Since we don't know if multipleStatements is on, we'll split by ';'
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                await db.query(statement);
                console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
            } catch (e) {
                console.log(`⚠️ Skiping/Error (might exist): ${e.message}`);
            }
        }

        console.log("🎉 Admin Schema Update Complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Schema Update Failed:", error);
        process.exit(1);
    }
};

runUpdate();
