import mysql from 'mysql2/promise';
(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sortsense_db'
    });
    try {
        const [rows] = await db.query('SELECT user_id, name, email FROM tbl_users WHERE email = "ebanabraham28@gmail.com"');
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
