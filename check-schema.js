import db from './db.js';
async function go() {
    const [rows] = await db.query('DESCRIBE tbl_pickup_requests');
    console.log(JSON.stringify(rows.map(r => ({ f: r.Field, t: r.Type })), null, 2));
    process.exit(0);
}
go();
