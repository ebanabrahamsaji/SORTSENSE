import db from './db.js';
import fs from 'fs';

async function checkRecent() {
    try {
        const [rows] = await db.query("SELECT * FROM tbl_user_center_messages ORDER BY created_at DESC LIMIT 5");
        fs.writeFileSync('tmp_recent_msgs.json', JSON.stringify(rows, null, 2));

        const [users] = await db.query("SELECT user_id, name, role FROM tbl_users WHERE user_id IN (SELECT sender_id FROM tbl_user_center_messages)");
        const [centers] = await db.query("SELECT center_id, center_name FROM tbl_collection_centers WHERE center_id IN (SELECT sender_id FROM tbl_user_center_messages)");

        fs.writeFileSync('tmp_identities.json', JSON.stringify({ users, centers }, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
checkRecent();
