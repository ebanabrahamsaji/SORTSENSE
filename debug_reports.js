import mysql from 'mysql2/promise';
(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sortsense_db'
    });
    try {
        const query = `
            (SELECT r.request_id, r.waste_type, r.quantity, r.status, r.created_at, c.center_name, 'PICKUP' as type
             FROM tbl_pickup_requests r
             LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
             WHERE r.user_id = 25)
            UNION ALL
            (SELECT r.request_id, r.category as waste_type, r.quantity_value as quantity, r.status, r.created_at, c.center_name, 'SPECIAL' as type
             FROM tbl_special_waste_requests r
             LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
             WHERE r.user_id = 25)
        `;
        const [rows] = await db.query(query);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
})();
