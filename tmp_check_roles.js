import db from './db.js';

async function checkRoles() {
    try {
        const [rows] = await db.query("SELECT DISTINCT sender_role FROM tbl_user_center_messages");
        console.log("Unique Roles:", rows);

        const [samples] = await db.query("SELECT sender_id, sender_role, message FROM tbl_user_center_messages LIMIT 5");
        console.log("Sample Data:", samples);
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
checkRoles();
