import db from './db.js';
const [rows] = await db.query("SELECT center_name, location FROM tbl_collection_centers");
rows.forEach(c => console.log(`Center: [${c.center_name}] | Loc: [${c.location}]`));
process.exit(0);
