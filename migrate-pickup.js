import db from './db.js';
async function migrate() {
    try {
        // Add approved_at column if missing
        await db.query(`ALTER TABLE tbl_pickup_requests ADD COLUMN IF NOT EXISTS approved_at DATETIME DEFAULT NULL`);
        console.log('✅ approved_at column ready');

        // Add assigned_at column if missing
        await db.query(`ALTER TABLE tbl_pickup_requests ADD COLUMN IF NOT EXISTS assigned_at DATETIME DEFAULT NULL`);
        console.log('✅ assigned_at column ready');

        // Add assigned_center_id column if missing (separate from center_id which is set on creation)
        // We reuse center_id — assignment happens at approval time.
        // But we need approved_at and assigned_at tracked.

        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err.message);
        process.exit(1);
    }
}
migrate();
