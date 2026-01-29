
import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runAuditSchemaInfo = async () => {
    try {
        console.log("Applying Audit Schema...");
        const sql = fs.readFileSync(path.join(__dirname, 'audit_schema.sql'), 'utf8');
        const statements = sql.split(';').filter(s => s.trim().length > 0);

        for (const s of statements) {
            try {
                await db.query(s);
            } catch (e) { console.log("Info/Skip:", e.message); }
        }
        console.log("✅ Audit Schema Applied.");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}
runAuditSchemaInfo();
