import db from './db.js';

async function checkReq4() {
    try {
        const [rows] = await db.query("SELECT * FROM tbl_special_waste_requests WHERE request_id = 4");
        console.log(JSON.stringify(rows[0], null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkReq4();
