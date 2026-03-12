import mysql from 'mysql2/promise';
(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sortsense_db'
    });
    try {
        const [rows] = await db.query('SELECT * FROM tbl_user_center_messages WHERE request_id = 64 ORDER BY message_id');
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
