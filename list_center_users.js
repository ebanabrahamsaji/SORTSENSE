
import db from './db.js';

async function listCenterUsers() {
    try {
        const [rows] = await db.query("SELECT id, name, email, role, center_id FROM tbl_users WHERE role = 'center'");
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

listCenterUsers();
