import db from './db.js';

async function improveSchema() {
    try {
        console.log("Improving center_messages schema...");

        // Add sender_id if it doesn't exist
        await db.query(`ALTER TABLE center_messages ADD COLUMN IF NOT EXISTS sender_id INT`);

        // Add receiver_id if it doesn't exist
        await db.query(`ALTER TABLE center_messages ADD COLUMN IF NOT EXISTS receiver_id INT`);

        // Add receiver_role if it doesn't exist
        await db.query(`ALTER TABLE center_messages ADD COLUMN IF NOT EXISTS receiver_role ENUM('ADMIN', 'CENTER')`);

        // Check if message column needs to be renamed to message_text
        const [columns] = await db.query("SHOW COLUMNS FROM center_messages");
        const columnNames = columns.map(c => c.Field);

        if (columnNames.includes('message') && !columnNames.includes('message_text')) {
            await db.query(`ALTER TABLE center_messages CHANGE COLUMN message message_text TEXT`);
        } else if (!columnNames.includes('message') && !columnNames.includes('message_text')) {
            await db.query(`ALTER TABLE center_messages ADD COLUMN message_text TEXT`);
        }

        if (columnNames.includes('created_at') && !columnNames.includes('timestamp')) {
            await db.query(`ALTER TABLE center_messages CHANGE COLUMN created_at timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        } else if (!columnNames.includes('created_at') && !columnNames.includes('timestamp')) {
            await db.query(`ALTER TABLE center_messages ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        }

        if (!columnNames.includes('is_read')) {
            await db.query(`ALTER TABLE center_messages ADD COLUMN is_read TINYINT(1) DEFAULT 0`);
        }

        console.log("Schema improvement complete.");
        process.exit(0);
    } catch (err) {
        console.error("Schema Improve Error:", err);
        process.exit(1);
    }
}

improveSchema();
