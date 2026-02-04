import db from './db.js';

async function deleteUser() {
    try {
        const [users] = await db.query('SELECT * FROM tbl_users WHERE name = ?', ['Eban Abraham Saji']);
        if (users.length === 0) {
            console.log('User "Eban Abraham Saji" not found.');
            process.exit(0);
        }

        const user = users[0];
        console.log(`Found user: ${user.name} (ID: ${user.user_id}, Email: ${user.email})`);

        const [result] = await db.query('DELETE FROM tbl_users WHERE user_id = ?', [user.user_id]);
        console.log(`Deleted user. Affected rows: ${result.affectedRows}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteUser();
