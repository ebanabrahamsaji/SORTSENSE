import db from './db.js';

async function migrate() {
    try {
        console.log("Starting message data cleanup...");

        // 1. Fix Admin names
        const [adminRes] = await db.query(`
            UPDATE tbl_center_messages 
            SET sender_name = 'Administrator' 
            WHERE sender_role = 'ADMIN' OR sender_name IS NULL OR sender_name = 'null'
        `);
        console.log(`Updated ${adminRes.affectedRows} admin/null records to 'Administrator'.`);

        // 2. Fix Center names (Attempt join with tbl_collection_centers)
        // Note: sender_id for CENTER messages should match center_id in centers table
        const [centerRes] = await db.query(`
            UPDATE tbl_center_messages m
            JOIN tbl_collection_centers c ON m.sender_id = c.center_id
            SET m.sender_name = c.username
            WHERE m.sender_role = 'CENTER'
        `);
        console.log(`Updated ${centerRes.affectedRows} center records with actual usernames.`);

        // 3. Fallback for any remaining CENTER records without a name
        const [fallbackRes] = await db.query(`
            UPDATE tbl_center_messages 
            SET sender_name = 'Center' 
            WHERE sender_role = 'CENTER' AND (sender_name IS NULL OR sender_name = 'null' OR sender_name = '')
        `);
        console.log(`Updated ${fallbackRes.affectedRows} center records with fallback 'Center'.`);

        console.log("Cleanup complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration Error:", err);
        process.exit(1);
    }
}

migrate();
