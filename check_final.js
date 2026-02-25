import db from './db.js';
async function run() {
    const [cols] = await db.query("DESCRIBE tbl_collection_centers");
    console.log("FIELDS:", cols.map(c => c.Field));
    process.exit();
}
run();
