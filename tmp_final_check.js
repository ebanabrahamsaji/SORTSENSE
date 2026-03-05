import db from './db.js';
const [rows] = await db.query("SELECT center_id, center_name, location FROM tbl_collection_centers");
rows.forEach(r => {
    if (r.location && r.location.toLowerCase() === 'kanjirapally') {
        console.log(`${r.center_id} : "${r.center_name}" (Loc: ${r.location})`);
    }
});
process.exit(0);
