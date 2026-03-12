import mysql from 'mysql2/promise';
import fs from 'fs';
(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sortsense_db'
    });
    try {
        const [rows] = await db.query('DESCRIBE tbl_pickup_requests');
        fs.writeFileSync('pickup_requests_schema.json', JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
