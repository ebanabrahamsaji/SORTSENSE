
import db from './db.js';

async function migrate() {
    try {
        console.log("Starting migration: Adding columns to tbl_collection_centers...");

        // Add is_online
        try {
            await db.query("ALTER TABLE tbl_collection_centers ADD COLUMN is_online BOOLEAN DEFAULT FALSE");
            console.log("Added is_online column");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAMES') console.log("is_online column already exists");
            else throw e;
        }

        // Add last_seen
        try {
            await db.query("ALTER TABLE tbl_collection_centers ADD COLUMN last_seen TIMESTAMP NULL");
            console.log("Added last_seen column");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAMES') console.log("last_seen column already exists");
            else throw e;
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
