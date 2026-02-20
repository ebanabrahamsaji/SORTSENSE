
import db from './db.js';

(async () => {
    console.log("Checking for 'tbl_user_history'...");
    try {
        const [rows] = await db.query("SHOW TABLES LIKE 'tbl_user_history'");
        if (rows.length === 0) {
            console.log("Table missing. Creating 'tbl_user_history'...");
            const schema = `
                CREATE TABLE tbl_user_history (
                    history_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    activity_type VARCHAR(50) NOT NULL COMMENT 'SCAN, SEARCH, PICKUP',
                    details JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await db.query(schema);
            console.log("Table created successfully.");
        } else {
            console.log("Table 'tbl_user_history' already exists.");
        }
    } catch (e) {
        console.error("Database Error:", e);
    }
    process.exit();
})();
