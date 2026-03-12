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
        const [rows] = await db.query('SELECT * FROM tbl_collection_centers WHERE center_id = 699');
        fs.writeFileSync('center_699_details.json', JSON.stringify(rows[0], null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
