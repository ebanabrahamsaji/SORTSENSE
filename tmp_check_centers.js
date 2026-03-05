import db from './db.js';
const [rows] = await db.query("DESCRIBE tbl_collection_centers");
console.log(JSON.stringify(rows, null, 2));

const [centers] = await db.query("SELECT center_id, center_name, location, type FROM tbl_collection_centers");
console.log("Centers Data:", JSON.stringify(centers, null, 2));

process.exit(0);
