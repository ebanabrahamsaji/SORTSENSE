import db from './db.js';
const [rows] = await db.query("SELECT location FROM tbl_waste_records WHERE user_id = 3");
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
