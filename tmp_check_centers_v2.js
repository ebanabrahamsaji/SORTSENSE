import db from './db.js';
const [rows] = await db.query("DESCRIBE tbl_collection_centers");
console.log("Columns:", rows.map(r => r.Field).join(', '));

const [centers] = await db.query("SELECT center_id, center_name, location FROM tbl_collection_centers");
console.log("Centers Data:");
centers.forEach(c => console.log(`${c.center_id}: ${c.center_name} (Loc: ${c.location})`));

process.exit(0);
