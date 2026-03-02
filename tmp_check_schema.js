import db from './db.js';
import fs from 'fs';

async function check() {
    try {
        // Find centers with "Kanjirapally" in name but location set to "Kochi"
        const [wrongLocCenters] = await db.query(`
            SELECT center_id, center_name, location, address
            FROM tbl_collection_centers
            WHERE center_name LIKE '%Kanjirapally%' OR center_name LIKE '%kanjirapally%'
        `);

        // All users with their location
        const [users] = await db.query(`
            SELECT user_id, name, location, city
            FROM tbl_users
            WHERE role = 'USER' OR role IS NULL
            LIMIT 20
        `);

        // Check all active pickup requests with full details
        const [reqs] = await db.query(`
            SELECT r.request_id, r.user_id, r.center_id, r.address, r.status,
                   u.name as user_name, u.location as user_location,
                   c.center_name, c.location as center_location
            FROM tbl_pickup_requests r
            JOIN tbl_users u ON r.user_id = u.user_id
            LEFT JOIN tbl_collection_centers c ON r.center_id = c.center_id
            ORDER BY r.created_at DESC
        `);

        fs.writeFileSync('location_analysis.json', JSON.stringify({
            kanjirapalyCenters: wrongLocCenters,
            users,
            allRequests: reqs
        }, null, 2));

        console.log("Done! Check location_analysis.json");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
