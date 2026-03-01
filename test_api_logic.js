import db from './db.js';

async function testApiLogic() {
    try {
        console.log("--- Testing API Logic (CASE statement) ---");
        const selectClause = `
            SELECT cc.center_id, cc.center_name, cc.is_online, cc.last_seen,
            CASE
                WHEN cc.is_online = 0 THEN 'CLOSED'
                WHEN TIMESTAMPDIFF(MINUTE, cc.last_seen, NOW()) <= 2 THEN 'OPEN'
                WHEN TIMESTAMPDIFF(MINUTE, cc.last_seen, NOW()) <= 5 THEN 'IDLE'
                ELSE 'CLOSED'
            END AS live_status
            FROM tbl_collection_centers cc
        `;

        const [results] = await db.query(selectClause);
        console.table(results);

        process.exit(0);
    } catch (err) {
        console.error("API logic test failed:", err);
        process.exit(1);
    }
}

testApiLogic();
