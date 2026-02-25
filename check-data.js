import db from './db.js';

async function check() {
    try {
        const [rows] = await db.query("SELECT * FROM tbl_center_messages ORDER BY created_at DESC LIMIT 5");
        rows.forEach(r => {
            console.log(`ID: ${r.message_id} SRole: ${r.sender_role} SName: ${r.sender_name} Text: ${r.message_text.substring(0, 20)}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
