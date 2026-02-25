import db from './db.js';

async function test() {
    try {
        console.log("Attempting test insertion...");
        const query = `
            INSERT INTO tbl_center_messages 
            (sender_id, sender_role, sender_name, center_id, receiver_id, receiver_role, message_text, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        await db.query(query, [
            1,
            'CENTER',
            'Test Center',
            1,
            0,
            'ADMIN',
            'Test Message'
        ]);

        console.log("INSERTION SUCCESSFUL");
        process.exit(0);
    } catch (error) {
        console.error("INSERTION FAILED:", error.message);
        process.exit(1);
    }
}

test();
