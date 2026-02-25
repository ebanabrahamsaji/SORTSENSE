import db from './db.js';
async function migrate() {
    try {
        const [cols] = await db.query("DESCRIBE tbl_collection_centers");
        const existing = cols.map(c => c.Field);

        const updates = [];
        if (!existing.includes('username'))
            updates.push("ADD COLUMN username VARCHAR(50) UNIQUE AFTER center_id");
        if (!existing.includes('password_hash'))
            updates.push("ADD COLUMN password_hash VARCHAR(255) AFTER username");
        if (!existing.includes('is_logged_in'))
            updates.push("ADD COLUMN is_logged_in TINYINT(1) DEFAULT 0");
        if (!existing.includes('last_active_at'))
            updates.push("ADD COLUMN last_active_at TIMESTAMP NULL");
        if (!existing.includes('current_operational_status'))
            updates.push("ADD COLUMN current_operational_status VARCHAR(20) DEFAULT 'CLOSED'");

        if (updates.length > 0) {
            console.log("Applying updates:", updates);
            await db.query(`ALTER TABLE tbl_collection_centers ${updates.join(', ')}`);
            console.log("✅ Database updated.");
        } else {
            console.log("ℹ️ All fields already exist.");
        }
    } catch (err) {
        console.error("❌ Migration error:", err);
    }
    process.exit();
}
migrate();
