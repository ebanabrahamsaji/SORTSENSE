import db from './db.js';
const [rows] = await db.query("DESCRIBE tbl_users");
console.log(JSON.stringify(rows, null, 2));
process.exit();
