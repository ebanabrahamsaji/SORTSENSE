import db from './db.js';

async function run() {
    try {
        const requestId = 64; // Based on previous checks
        const [messages] = await db.query(`
            SELECT 
                m.message_id,
                m.sender_id,
                m.sender_role,
                m.message,
                m.created_at,
                u.name as userName,
                c.center_name as centerName
            FROM tbl_user_center_messages m
            JOIN tbl_pickup_requests r ON m.request_id = r.request_id
            LEFT JOIN tbl_users u ON r.user_id = u.user_id
            LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
            WHERE m.request_id = ?
            ORDER BY m.created_at ASC
        `, [requestId]);

        const formattedMessages = messages.map(msg => {
            const role = String(msg.sender_role || '').toLowerCase();
            let resolvedName = 'System';

            if (role === 'user') {
                resolvedName = msg.userName || 'User';
            } else if (role === 'center') {
                resolvedName = msg.centerName || 'Collection Center';
            }

            return {
                message_id: msg.message_id,
                sender_id: msg.sender_id,
                sender_role: msg.sender_role,
                sender_name: resolvedName,
                message: msg.message,
                created_at: msg.created_at
            };
        });

        console.log(JSON.stringify(formattedMessages, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
run();
