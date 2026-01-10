import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
    console.log("🛠️  Initializing Database...");

    // 1. Connect to Server (No DB selected yet)
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log("✅ Connected to MySQL.");
    } catch (err) {
        console.error("❌ Connection Failed:", err.message);
        return;
    }

    try {
        // 2. Create DB
        await connection.query("CREATE DATABASE IF NOT EXISTS sortsense_db");
        console.log("✅ Database 'sortsense_db' ensured.");

        // 3. Switch to DB
        await connection.changeUser({ database: 'sortsense_db' });

        // 4. Run Schema
        const schemaPath = path.join(__dirname, 'sortsense_schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await connection.query(schemaSql);
            console.log("✅ Schema imported successfully.");
        } else {
            console.error("❌ sortsense_schema.sql not found at:", schemaPath);
        }

    } catch (err) {
        console.error("❌ Error initializing:", err.message);
    } finally {
        await connection.end();
        console.log("🏁 Done.");
    }
}

initDatabase();
