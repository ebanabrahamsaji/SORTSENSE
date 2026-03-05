import db from './db.js';
const [centers] = await db.query("SELECT center_id, center_name, status, available_slots FROM tbl_collection_centers");
centers.forEach(c => {
    if (c.center_name.toLowerCase().includes('kanjirapally')) {
        console.log(`Matched Name: ${c.center_id} : ${c.center_name}`);
    }
});
process.exit(0);
