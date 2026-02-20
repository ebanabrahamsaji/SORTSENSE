import db from './db.js';

async function check() {
    try {
        const [users] = await db.query('SELECT user_id, name, monthly_points FROM tbl_users LIMIT 5');
        console.log('--- Users ---');
        console.table(users);

        const [challenges] = await db.query('SELECT * FROM tbl_challenges');
        console.log('--- Challenges ---');
        console.table(challenges);

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

check();
