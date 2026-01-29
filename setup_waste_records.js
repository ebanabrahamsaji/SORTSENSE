import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sortsense_db'
};

async function setupWasteRecordsTable() {
    const connection = await mysql.createConnection(config);
    try {
        console.log("Creating tbl_waste_records...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tbl_waste_records (
                record_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                waste_type VARCHAR(100),
                category VARCHAR(50),
                weight DECIMAL(10, 2),
                quantity INT,
                location VARCHAR(255),
                scan_method ENUM('SCAN', 'MANUAL', 'PICKUP', 'ADMIN'),
                pickup_id INT NULL,
                status ENUM('Scanned', 'Pending', 'Verified', 'Approved', 'Scheduled', 'Picked', 'Processed', 'Recycled') DEFAULT 'Pending',
                verified_by INT NULL,
                comments TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE SET NULL
            )
        `);
        console.log("✅ tbl_waste_records created or already exists.");

        // Check if admin audit logs table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tbl_admin_audit_logs (
                log_id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT,
                action VARCHAR(100),
                target_type VARCHAR(50),
                target_id INT,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ tbl_admin_audit_logs created.");

    } catch (err) {
        console.error("❌ Error setting up table:", err);
    } finally {
        await connection.end();
    }
}

setupWasteRecordsTable();
