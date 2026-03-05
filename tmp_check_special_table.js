import db from './db.js';

async function check() {
    try {
        const [columns] = await db.query("DESCRIBE tbl_special_waste_requests");
        console.log("Columns in tbl_special_waste_requests:");
        console.table(columns.map(c => ({ Field: c.Field, Type: c.Type })));

        const [rows] = await db.query("SELECT * FROM tbl_special_waste_requests LIMIT 5");
        console.log("\nFirst 5 rows in tbl_special_waste_requests:");
        console.table(rows);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
