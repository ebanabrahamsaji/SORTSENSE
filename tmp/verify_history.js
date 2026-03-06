import db from '../db.js';

async function testCenterHistory() {
    const centerId = 699;
    try {
        const [centerRows] = await db.query(
            "SELECT location FROM tbl_collection_centers WHERE center_id = ?",
            [centerId]
        );
        const centerLocation = (centerRows[0] && centerRows[0].location) ? centerRows[0].location.trim() : null;

        const locationPattern = `%${centerLocation}%`;
        const historyQuery = `
            SELECT r.*, u.name AS user_name
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            WHERE (LOWER(TRIM(COALESCE(u.location, ''))) = LOWER(?) OR LOWER(r.address) LIKE LOWER(?) OR r.center_id = ?)
              AND r.status IN ('Completed', 'Rejected', 'Cancelled')
            LIMIT 50
        `;
        const swHistoryQuery = `
            SELECT r.request_id, r.category AS waste_type, r.status, 'SPECIAL' AS type
            FROM tbl_special_waste_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            WHERE r.center_id = ?
              AND r.status IN ('Completed', 'Rejected', 'Cancelled')
            LIMIT 50
        `;

        const [hReqs, swReqs] = await Promise.all([
            db.query(historyQuery, [centerLocation, locationPattern, centerId]).then(r => r[0]),
            db.query(swHistoryQuery, [centerId]).then(r => r[0])
        ]);

        console.log(`PICKUP_HISTORY_COUNT: ${hReqs?.length || 0}`);
        console.log(`SW_HISTORY_COUNT: ${swReqs?.length || 0}`);
        console.log(`TOTAL_UNIFIED_COUNT: ${(hReqs?.length || 0) + (swReqs?.length || 0)}`);

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        process.exit();
    }
}

testCenterHistory();
