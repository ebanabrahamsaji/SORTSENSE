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
        const query = `SELECT * FROM tbl_user_center_messages ORDER BY created_at DESC LIMIT 10`;
        const [rows] = await db.query(query);
        fs.writeFileSync('msgs.json', JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
