import mysql from 'mysql2/promise';
(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sortsense_db'
    });
    try {
        const [users] = await db.query('SELECT user_id, name, role FROM tbl_users WHERE name LIKE "%EBAN ABRAHAM%"');
        console.log('Users:', users);
        const [centers] = await db.query('SELECT center_id, center_name FROM tbl_collection_centers WHERE center_name LIKE "%EBAN ABRAHAM%"');
        console.log('Centers:', centers);
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
