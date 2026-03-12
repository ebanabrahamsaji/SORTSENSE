
import db from './db.js';

async function listCenterUsers() {
    try {
        const [rows] = await db.query("SELECT id, name, email, role FROM tbl_users WHERE LOWER(role) = 'center'");
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

listCenterUsers();
