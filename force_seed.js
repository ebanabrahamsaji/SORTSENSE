import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function forceSeed() {
    console.log("🌱 Force Seeding Database...");

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: 'sortsense_db',
        multipleStatements: true
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log("✅ Connected.");

        // 1. Clear existing centers to avoid duplicates/stale types
        console.log("🗑️ Clearing old collection centers...");
        await connection.query('DELETE FROM tbl_collection_centers');
        // Check if table empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM tbl_collection_centers');
        console.log(`info: Table now has ${rows[0].count} rows.`);

        // 2. Read Seed File
        const seedPath = path.join(__dirname, 'kerala_data_seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        // 3. Execute Seed
        console.log("🚀 Injecting new centers...");
        await connection.query(seedSql);

        console.log("✅ Force Seed Complete.");

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        if (connection) await connection.end();
    }
}

forceSeed();
