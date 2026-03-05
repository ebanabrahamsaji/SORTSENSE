import db from './db.js';

async function run() {
    try {
        const [res] = await db.query('SELECT message_id, sender_id, sender_role, message FROM tbl_user_center_messages WHERE request_id = 64 ORDER BY created_at ASC');
        console.log(JSON.stringify(res, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
run();
