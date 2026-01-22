import db from './db.js';

async function updateSchema() {
    try {
        console.log("Updating tbl_pickup_requests status column...");
        // Change to VARCHAR to cover all requested cases (Pending, Approved, Completed, Rejected) and avoid ENUM issues.
        const query = `ALTER TABLE tbl_pickup_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'`;
        await db.query(query);
        console.log("✅ Schema updated successfully: status column is now VARCHAR(50).");
        process.exit(0);
    } catch (error) {
        console.error("❌ Schema update failed:", error);
        process.exit(1);
    }
}

updateSchema();
