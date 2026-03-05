import db from './db.js';

async function finalAnalysis() {
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

        console.log("=== ANALYSIS OF APPROVED SPECIAL WASTE REQUESTS ===");
        rows.forEach(r => {
            console.log(`\nRequest #${r.request_id}:`);
            console.log(`  - User: ${r.user_name || "Unknown (ID: 25?)"}`);
            console.log(`  - Center: ${r.center_name}`);
            console.log(`  - Category: ${r.category}`);
            console.log(`  - Quantity: ${r.quantity_value} ${r.quantity_unit}`);
            console.log(`  - Assignment: ${r.assignment_status}`);
            console.log(`  - Date: ${r.created_at}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

finalAnalysis();
