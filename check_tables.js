import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sortsense_db'
};

async function checkTables() {
    let log = "🔍 Checking Tables...\n";
    let connection;
    try {
        connection = await mysql.createConnection(config);
        const [rows] = await connection.query("SHOW TABLES");
        log += JSON.stringify(rows, null, 2);
    } catch (err) {
        log += "❌ Error: " + err.message + "\n" + JSON.stringify(err);
    } finally {
        if (connection) await connection.end();
        fs.writeFileSync('tables_log.txt', log);
    }
}

checkTables();
