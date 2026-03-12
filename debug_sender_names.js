import mysql from 'mysql2/promise';
(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sortsense_db'
    });
    try {
        const [messages] = await db.query(`
            SELECT 
                m.message_id,
                m.sender_id,
                m.sender_role,
                u.name as senderUserName,
                c.center_name as senderCenterName
            FROM tbl_user_center_messages m
            LEFT JOIN tbl_users u ON (m.sender_role = 'user' AND m.sender_id = u.user_id)
            LEFT JOIN tbl_collection_centers c ON (m.sender_role = 'center' AND m.sender_id = c.center_id)
            WHERE m.request_id = 64
        `);
        console.log(JSON.stringify(messages, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
