import db from './db.js';
const [rows] = await db.query("DESCRIBE tbl_pickup_items");
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
