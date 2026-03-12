import db from './db.js';

async function checkMessaging() {
    try {
        console.log("--- TABLE SCHEMA (tbl_user_center_messages) ---");
        const [columns] = await db.query('DESCRIBE tbl_user_center_messages');
        console.table(columns);

        console.log("\n--- RECENT MESSAGES ---");
        const [messages] = await db.query(`
            SELECT 
                m.message_id, 
                m.sender_id, 
                m.sender_role, 
                m.receiver_id, 
                m.receiver_role, 
                m.request_id, 
                m.message,
                m.created_at
            FROM tbl_user_center_messages m
            ORDER BY m.created_at DESC
            LIMIT 5
        `);
        console.log(JSON.stringify(messages, null, 2));

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        process.exit();
    }
}

checkMessaging();
