import db from './db.js';

async function fix() {
    try {
        console.log("Dropping foreign key constraint on sender_id...");
        // First, find the constraint name if it's different, but we saw it's tbl_center_messages_ibfk_1
        await db.query("ALTER TABLE tbl_center_messages DROP FOREIGN KEY tbl_center_messages_ibfk_1");

        console.log("Making sender_id nullable and removing strict index...");
        // Actually, sender_id is already an index.
        await db.query("ALTER TABLE tbl_center_messages MODIFY COLUMN sender_id INT NULL");

        console.log("Fix complete.");
        process.exit(0);
    } catch (err) {
        console.error("Fix Error:", err);
        process.exit(1);
    }
}

fix();
