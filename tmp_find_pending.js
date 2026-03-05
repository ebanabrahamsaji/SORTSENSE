import db from './db.js';
const [rows] = await db.query("SELECT request_id, user_id, waste_type, quantity, address FROM tbl_pickup_requests WHERE status = 'Pending' AND quantity = 10 AND address LIKE '%kanjirapally%'");
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
