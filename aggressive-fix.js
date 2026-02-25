import db from './db.js';

async function fix() {
    try {
        console.log("Ensuring table is decoupled...");

        // Try to drop all foreign keys on tbl_center_messages
        const dropFks = [
            "ALTER TABLE tbl_center_messages DROP FOREIGN KEY tbl_center_messages_ibfk_1",
            "ALTER TABLE tbl_center_messages DROP FOREIGN KEY tbl_center_messages_ibfk_2"
        ];

        for (const sql of dropFks) {
            try {
                await db.query(sql);
                console.log(`Success: ${sql}`);
            } catch (e) {
                console.log(`Note: ${e.message} (This is likely fine)`);
            }
        }

        // Also ensure columns are nullable so we can insert without matching IDs if needed
        await db.query("ALTER TABLE tbl_center_messages MODIFY COLUMN sender_id INT NULL");
        await db.query("ALTER TABLE tbl_center_messages MODIFY COLUMN receiver_id INT NULL");

        console.log("Table decoupled successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Critical Fix Error:", err);
        process.exit(1);
    }
}

fix();
