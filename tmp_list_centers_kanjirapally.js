import db from './db.js';
const [centers] = await db.query("SELECT center_id, center_name, location FROM tbl_collection_centers");
for (const center of centers) {
    if (center.center_name.toLowerCase().includes('kanjirapally')) {
        console.log(`Matched (ID: ${center.center_id}): ${center.center_name} (Loc: ${center.location})`);
    }
}
process.exit(0);
