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
        const [rows] = await db.query('SELECT * FROM tbl_user_center_messages WHERE request_id = 64 ORDER BY message_id');
        fs.writeFileSync('messages_dump.json', JSON.stringify(rows, null, 2));
        console.log("Dumped " + rows.length + " messages");
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
