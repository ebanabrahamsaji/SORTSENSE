import db from './db.js';

async function simulateCenterReply() {
    try {
        const requestId = 64;
        const senderId = 699; // Center ID
        const senderRole = 'center';
        const receiverId = 56; // User ID
        const receiverRole = 'user';
        const message = "Hi Eban, your request #64 is completed. Thank you!";

        console.log("📤 Sending center reply...");
        
        await db.query(`
            INSERT INTO tbl_user_center_messages 
            (sender_id, sender_role, receiver_id, receiver_role, request_id, message)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [senderId, senderRole, receiverId, receiverRole, requestId, message]);

        console.log("✅ Reply sent!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
simulateCenterReply();
