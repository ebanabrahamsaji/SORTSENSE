import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
    console.log("🌱 Seeding Database...");

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
        console.log("✅ Connected to sortsense_db.");

        const seedPath = path.join(__dirname, 'kerala_data_seed.sql');
        if (fs.existsSync(seedPath)) {
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await connection.query(seedSql);
            console.log("✅ Data seeded successfully.");
        } else {
            console.error("❌ kerala_data_seed.sql not found.");
        }

    } catch (err) {
        console.error("❌ Error seeding:", err.message);
    } finally {
        if (connection) await connection.end();
        console.log("🏁 Seed Complete.");
    }
}

seedDatabase();
