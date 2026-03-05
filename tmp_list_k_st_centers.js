import db from './db.js';
const [centers] = await db.query("SELECT center_id, center_name, status, available_slots FROM tbl_collection_centers WHERE LOWER(TRIM(location)) = 'kanjirapally'");
centers.forEach(c => {
    console.log(`ID: ${c.center_id}, Name: ${c.center_name}, Status: ${c.status}, Slots: ${c.available_slots}`);
});
process.exit(0);
