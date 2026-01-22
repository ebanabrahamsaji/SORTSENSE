import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sortsense_db'
};

const updateSchema = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database for schema update.');

        // 1. Create User History Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tbl_user_history (
                history_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                activity_type ENUM('SCAN', 'SEARCH', 'PICKUP_REQUEST') NOT NULL,
                details JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ tbl_user_history created/verified.');

        // 2. Create Notifications Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tbl_notifications (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ tbl_notifications created/verified.');

    } catch (error) {
        console.error('❌ Schema Update Failed:', error);
    } finally {
        if (connection) await connection.end();
    }
};

updateSchema();
