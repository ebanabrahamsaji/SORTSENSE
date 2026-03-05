import db from './db.js';
import fs from 'fs';

async function checkRoles() {
    try {
        const [rows] = await db.query("SELECT DISTINCT sender_role FROM tbl_user_center_messages");
        const [samples] = await db.query("SELECT sender_id, sender_role, message FROM tbl_user_center_messages ORDER BY created_at DESC LIMIT 10");

        fs.writeFileSync('tmp_roles_check.json', JSON.stringify({ roles: rows, samples: samples }, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
checkRoles();
