import db from './db.js';
import fs from 'fs';

async function run() {
    const [c] = await db.query("SELECT * FROM tbl_collection_centers");
    const [u] = await db.query("SELECT * FROM tbl_users WHERE role = 'CENTER'");
    const [p] = await db.query("SELECT * FROM tbl_pickup_requests ORDER BY request_id DESC LIMIT 5");

    fs.writeFileSync('out.json', JSON.stringify({
        centers: c.map(x => ({ id: x.center_id, email: x.email, user_id: x.user_id })),
        users: u.map(x => ({ id: x.user_id, email: x.email, center_id: x.center_id })),
        reqs: p.map(x => ({ req: x.request_id, center: x.center_id, user: x.user_id, status: x.status }))
    }, null, 2));
    process.exit();
}
run();
