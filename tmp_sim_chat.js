import db from './db.js';

async function run() {
    const [res] = await db.query(`
        SELECT 
            m.*,
            u.name as username,
            c.center_name as centerUsername
        FROM tbl_user_center_messages m
        LEFT JOIN tbl_users u ON (m.sender_role = 'user' AND m.sender_id = u.user_id) OR (m.receiver_role = 'user' AND m.receiver_id = u.user_id)
        LEFT JOIN tbl_collection_centers c ON (m.sender_role = 'center' AND m.sender_id = c.center_id) OR (m.receiver_role = 'center' AND m.receiver_id = c.center_id)
        WHERE m.request_id = 64
        ORDER BY m.created_at ASC
    `);

    const formattedMessages = res.map(msg => ({
        sender_id: msg.sender_id,
        sender_role: msg.sender_role,
        sender_name: msg.sender_role === 'user' ? msg.username : msg.centerUsername,
        message: msg.message,
        created_at: msg.created_at
    }));

    // Simulate User Dashboard (currentUserId = 25)
    console.log("=== USER DASHBOARD (User 25) ===");
    formattedMessages.forEach(m => {
        const isMe = String(m.sender_id) === String("25");
        console.log(`Msg: "${m.message}" | sender_id=${m.sender_id} | name=${m.sender_name} | isMe=${isMe} | bg=${isMe ? "BLUE" : "GREY"}`);
    });

    // Simulate Center Dashboard (centerId = 690)
    console.log("\n=== CENTER DASHBOARD (Center 690) ===");
    formattedMessages.forEach(m => {
        const isMe = String(m.sender_id) === String("690");
        console.log(`Msg: "${m.message}" | sender_id=${m.sender_id} | name=${m.sender_name} | isMe=${isMe} | bg=${isMe ? "GREEN" : "GREY"}`);
    });

    process.exit();
}
run();
