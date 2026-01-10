import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    console.log("🛠️  Initializing MySQL Database...");

    // Connection Config
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '', // Start with empty, common for default XAMPP
        multipleStatements: true // Required for running strict SQL scripts
    };

    let connection;

    // 1. Try connecting (Handle password issues)
    try {
        connection = await mysql.createConnection(config);
        console.log("✅ Connected to MySQL Server");
    } catch (err) {
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log("⚠️  Access Denied with empty password. Trying 'password'...");
            try {
                config.password = 'password';
                connection = await mysql.createConnection(config);
                console.log("✅ Connected with 'password'");
            } catch (err2) {
                console.error("❌ Could not connect to MySQL. Please check your credentials in .env");
                console.error(err2.message);
                process.exit(1);
            }
        } else {
            console.error("❌ Connection Error:", err.message);
            process.exit(1);
        }
    }

    // 2. Read Schema File
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        console.error("❌ schema.sql not found!");
        process.exit(1);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // 3. Execute Schema
    try {
        await connection.query(schemaSql);
        console.log("✅ Database 'sortsense_db' created/updated successfully.");
        console.log("✅ Tables created and Seed Data inserted.");
    } catch (err) {
        console.error("❌ Error executing schema:", err.message);
    } finally {
        await connection.end();
    }
}

setupDatabase();
