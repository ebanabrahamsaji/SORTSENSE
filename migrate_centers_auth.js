import db from './db.js';
async function migrate() {
    try {
        console.log("Migrating tbl_collection_centers...");
        await db.query(`
            ALTER TABLE tbl_collection_centers 
            ADD COLUMN username VARCHAR(50) UNIQUE AFTER center_id,
            ADD COLUMN password_hash VARCHAR(255) AFTER username
        `);
        console.log("✅ Columns added successfully.");
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("ℹ️ Columns already exist.");
        } else {
            console.error("❌ Migration failed:", err);
        }
    }
    process.exit();
}
migrate();
