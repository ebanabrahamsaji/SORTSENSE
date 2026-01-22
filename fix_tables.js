import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sortsense_db',
    multipleStatements: true
};

async function fixTables() {
    console.log("🛠️  Fixing Database Tables...");
    let connection;

    try {
        connection = await mysql.createConnection(config);
        console.log("✅ Connected to Database.");

        // 1. Create Pickup Requests Table
        const createPickupSql = `
        CREATE TABLE IF NOT EXISTS tbl_pickup_requests (
            request_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            center_id INT NOT NULL,
            waste_type VARCHAR(50) NOT NULL,
            quantity DECIMAL(10, 2) NOT NULL,
            status ENUM('Pending', 'Approved', 'Completed') DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id) ON DELETE CASCADE
        );`;

        await connection.query(createPickupSql);
        console.log("✅ tbl_pickup_requests ensured.");

        // 2. Create Pickup Items Table
        const createItemsSql = `
        CREATE TABLE IF NOT EXISTS tbl_pickup_items (
            item_id INT AUTO_INCREMENT PRIMARY KEY,
            request_id INT NOT NULL,
            waste_type VARCHAR(50) NOT NULL,
            quantity DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (request_id) REFERENCES tbl_pickup_requests(request_id) ON DELETE CASCADE
        );`;

        await connection.query(createItemsSql);
        console.log("✅ tbl_pickup_items ensured.");

        // 3. Fix Lat/Lng types in Collection Centers (if needed - known issue from previous tasks)
        // Just ensuring it's not the cause. Usually 10,8 is fine.

    } catch (err) {
        console.error("❌ Error fixing tables:", err);
        console.error("Msg:", err.message);
    } finally {
        if (connection) await connection.end();
        console.log("🏁 Done.");
    }
}

fixTables();
