import db from './db.js';
const [centers] = await db.query("SELECT center_id, center_name, location FROM tbl_collection_centers WHERE LOWER(TRIM(location)) = 'kanjirapally' ORDER BY center_id ASC");
centers.forEach(c => console.log(`${c.center_id}: ${c.center_name}`));
process.exit(0);
