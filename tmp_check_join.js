import db from './db.js';
import fs from 'fs';

async function run() {
    try {
        const [res] = await db.query(`
            SELECT 
                m.*,
                u.name as name_u,
                c.center_name as name_c
            FROM tbl_user_center_messages m
            LEFT JOIN tbl_users u ON (LOWER(m.sender_role) = 'user' AND m.sender_id = u.user_id)
            LEFT JOIN tbl_collection_centers c ON (LOWER(m.sender_role) = 'center' AND m.sender_id = c.center_id)
            WHERE m.request_id = 64
            ORDER BY m.created_at ASC
        `);
        fs.writeFileSync('tmp_joined_messages.json', JSON.stringify(res, null, 2), 'utf8');
        console.log("Joined messages written to tmp_joined_messages.json");
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
run();
