
import db from './db.js';

async function debugMessaging() {
    console.log("--- DEBUGGING MESSAGING SYSTEM ---");
    try {
        // 1. Check Table Structure
        const [columns] = await db.query("SHOW COLUMNS FROM tbl_marketplace_messages");
        console.log("\n1. Table Structure (tbl_marketplace_messages):");
        console.log(columns.map(c => c.Field).join(', '));

        // 2. Check User Table Structure (for profile pic column name)
        const [userCols] = await db.query("SHOW COLUMNS FROM tbl_users");
        console.log("\n2. Table Structure (tbl_users):");
        const userFields = userCols.map(c => c.Field);
        console.log(userFields.join(', '));

        const hasProfilePic = userFields.includes('profile_picture');
        const hasProfilePicShort = userFields.includes('profile_pic');
        console.log(`   Has 'profile_picture'? ${hasProfilePic}`);
        console.log(`   Has 'profile_pic'? ${hasProfilePicShort}`);

        // 3. Check Message Count
        const [count] = await db.query("SELECT COUNT(*) as count FROM tbl_marketplace_messages");
        console.log(`\n3. Total Messages in DB: ${count[0].count}`);

        if (count[0].count > 0) {
            // 4. Sample Data
            const [rows] = await db.query("SELECT * FROM tbl_marketplace_messages ORDER BY created_at DESC LIMIT 1");
            console.log("\n4. Sample Message Data:");
            console.log(rows[0]);
        }

        // 5. Check Test Query
        const [users] = await db.query("SELECT user_id FROM tbl_users LIMIT 1");
        if (users.length > 0) {
            const testUserId = users[0].user_id;
            console.log(`\n5. Testing Query for User ID: ${testUserId}`);

            // The exact query from controller
            const query = `
                SELECT 
                    m.*,
                    sender.name AS sender_name, sender.email AS sender_email, sender.profile_picture AS sender_pic,
                    receiver.name AS receiver_name, receiver.email AS receiver_email, receiver.profile_picture AS receiver_pic,
                    p.title AS product_title, p.image_url AS product_image
                FROM tbl_marketplace_messages m
                JOIN tbl_users sender ON m.sender_id = sender.user_id
                JOIN tbl_users receiver ON m.receiver_id = receiver.user_id
                JOIN tbl_marketplace_items p ON m.product_id = p.item_id
                WHERE m.receiver_id = ? OR m.sender_id = ?
                ORDER BY m.created_at DESC
            `;

            try {
                const [msgs] = await db.query(query, [testUserId, testUserId]);
                console.log(`   Query Successful! Retrieved ${msgs.length} messages.`);
            } catch (err) {
                console.error("   Query FAILED:", err.sqlMessage || err.message);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("FATAL ERROR:", error);
        process.exit(1);
    }
}

debugMessaging();
