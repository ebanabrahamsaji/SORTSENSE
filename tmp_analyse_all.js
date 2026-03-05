import db from './db.js';

async function analyse() {
    try {
        console.log("--- Special Waste Requests (Approved) ---");
        const [special] = await db.query("SELECT * FROM tbl_special_waste_requests WHERE status = 'Approved'");
        console.table(special);

        console.log("\n--- Regular Pickup Requests (Approved) ---");
        const [regular] = await db.query("SELECT * FROM tbl_pickup_requests WHERE status = 'Approved'");
        console.table(regular);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

analyse();
