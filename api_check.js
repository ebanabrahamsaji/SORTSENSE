import db from './db.js';
import fs from 'fs';

async function check() {
    try {
        const centerId = 690; // HKS Kanjirapally

        // 1. Check center location
        const [centerRows] = await db.query("SELECT * FROM tbl_collection_centers WHERE center_id = ?", [centerId]);
        const center = centerRows[0];
        console.log("Center:", center);

        // 2. Check requests assigned to this center or matching location
        const centerLocation = center.location;
        const locationPattern = `%${centerLocation}%`;

        const [requests] = await db.query(`
            SELECT r.request_id, r.status, r.address, r.center_id, u.name, u.location as user_location
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            WHERE (
                LOWER(TRIM(COALESCE(u.location, ''))) = LOWER(?)
                OR LOWER(r.address) LIKE LOWER(?)
                OR r.center_id = ?
            )
        `, [centerLocation, locationPattern, centerId]);

        console.log(`Found ${requests.length} requests for center ${centerId}`);
        requests.forEach(r => console.log(`  ID ${r.request_id}: Status=${r.status}, UserLoc=${r.user_location}, CenterID=${r.center_id}`));

        fs.writeFileSync('api_check.json', JSON.stringify({ center, requests }, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
