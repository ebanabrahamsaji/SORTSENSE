import db from '../db.js';

async function getUsers() {
    try {
        const [rows] = await db.query('SELECT email FROM tbl_users WHERE role = "USER" LIMIT 1');
        if (rows.length > 0) {
            console.log(`USER_EMAIL=${rows[0].email}`);
        } else {
            console.log("USER_EMAIL=NOT_FOUND");
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

getUsers();
