import db from './db.js';

async function checkUsers() {
    try {
        const [rows] = await db.query('SELECT name, email, role FROM tbl_users LIMIT 10');
        console.log("=== Users in DB ===");
        rows.forEach(r => console.log(`${r.role}: ${r.name} (${r.email})`));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkUsers();
