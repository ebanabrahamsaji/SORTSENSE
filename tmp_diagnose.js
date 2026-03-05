import db from './db.js';

async function run() {
    try {
        const [u] = await db.query('SELECT user_id, name FROM tbl_users WHERE name LIKE "%EBAN%"');
        const [c] = await db.query('SELECT center_id, center_name FROM tbl_collection_centers WHERE center_name LIKE "%HKS%"');
        const [r] = await db.query('SELECT request_id, user_id, center_id, status FROM tbl_pickup_requests WHERE request_id = 64');
        console.log('USERS:', u);
        console.log('CENTERS:', c);
        console.log('REQUEST:', r);
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
run();
