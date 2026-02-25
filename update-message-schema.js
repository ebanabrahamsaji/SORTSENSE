import db from './db.js';

async function updateSchema() {
    try {
        console.log("Checking tbl_center_messages schema...");
        const [columns] = await db.query("SHOW COLUMNS FROM tbl_center_messages");
        const columnNames = columns.map(c => c.Field);

        const newColumns = [
            { name: 'sender_role', type: "ENUM('ADMIN', 'CENTER') DEFAULT 'ADMIN'" },
            { name: 'sender_name', type: 'VARCHAR(255)' },
            { name: 'receiver_id', type: 'INT' },
            { name: 'receiver_role', type: "ENUM('ADMIN', 'CENTER') DEFAULT 'CENTER'" }
        ];

        for (const col of newColumns) {
            if (!columnNames.includes(col.name)) {
                console.log(`Adding column ${col.name}...`);
                await db.query(`ALTER TABLE tbl_center_messages ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        // Rename columns if they don't exactly match the camelCase requirement for API but keep DB style snake_case
        // The requirement says "Ensure message schema contains: senderId...". 
        // In DB it's usually snake_case. I'll use snake_case in DB and map in controller.

        console.log("Schema update complete.");
        process.exit(0);
    } catch (err) {
        console.error("Schema Update Error:", err);
        process.exit(1);
    }
}

updateSchema();
