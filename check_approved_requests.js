import db from './db.js';

async function checkRequests() {
    try {
        const query = `
            SELECT 
                swr.request_id, 
                u.name AS user_name,
                cc.center_name,
                swr.category,
                swr.quantity_value, 
                swr.quantity_unit,
                swr.status, 
                swr.assignment_status,
                swr.created_at
            FROM tbl_special_waste_requests swr
            LEFT JOIN tbl_users u ON swr.user_id = u.user_id
            LEFT JOIN tbl_collection_centers cc ON swr.center_id = cc.center_id
            WHERE LOWER(swr.status) LIKE 'approved%'
        `;
        const [rows] = await db.query(query);
        console.log("Found rows:", rows.length);
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkRequests();