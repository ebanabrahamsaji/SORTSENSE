import db from './db.js';

async function listUsers() {
    try {
        const [users] = await db.query('SELECT user_id, name, email FROM tbl_users');
        console.log("--- Users List ---");
        users.forEach(u => {
            console.log(`ID: ${u.user_id}, Name: "${u.name}", Email: ${u.email}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
