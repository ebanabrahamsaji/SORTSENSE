import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password', // Default fallback
    database: process.env.DB_NAME || 'sortsense_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper to check connection
export async function checkDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.warn('⚠️  Switching to MOCK DATA functionality.');
        return false;
    }
}

export default pool;
