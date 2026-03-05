import db from './db.js';
import fs from 'fs';

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
    fs.writeFileSync('query_res.json', JSON.stringify(res, null, 2));
    process.exit();
}
run();
