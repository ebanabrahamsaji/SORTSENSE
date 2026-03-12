
import db from './db.js';

async function listCenterUsers() {
    try {
        const [rows] = await db.query("SELECT * FROM tbl_users WHERE role = 'center'");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

listCenterUsers();
