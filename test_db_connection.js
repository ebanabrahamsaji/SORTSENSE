import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'sortsense_db'
};

console.log("Testing connection with config:", { ...config, password: '***' });

(async () => {
    try {
        const conn = await mysql.createConnection(config);
        console.log("Success!");
        await conn.end();
    } catch (err) {
        console.error("Connection Failed. Error Details:");
        console.error("Code:", err.code);
        console.error("Errno:", err.errno);
        console.error("Message:", err.message);
        console.error("Full Error:", err);
    }
})();
