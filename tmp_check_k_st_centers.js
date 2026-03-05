import db from './db.js';
const [centers] = await db.query("SELECT center_id, center_name, status, available_slots FROM tbl_collection_centers WHERE LOWER(TRIM(location)) = 'kanjirapally'");
console.log(JSON.stringify(centers, null, 2));
process.exit(0);
