
import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSessionSchema = async () => {
    try {
        console.log("Applying Session Schema...");
        const sql = fs.readFileSync(path.join(__dirname, 'session_schema.sql'), 'utf8');

        // Split by semicolon to execute individually
        const statements = sql.split(';').filter(s => s.trim().length > 0);

        for (const s of statements) {
            try {
                await db.query(s);
            } catch (e) {
                console.log(`Info: ${e.message}`);
            }
        }

        console.log("✅ SESSION Schema Applied.");
        process.exit(0);
    } catch (e) {
        console.error("Critical Error:", e);
        process.exit(1);
    }
}
runSessionSchema();
