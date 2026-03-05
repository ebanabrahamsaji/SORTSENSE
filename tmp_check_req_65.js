import db from './db.js';
const [rows] = await db.query("SELECT * FROM tbl_pickup_requests WHERE request_id = 65");
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
