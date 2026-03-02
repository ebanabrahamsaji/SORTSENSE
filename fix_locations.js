import db from './db.js';

async function fixLocations() {
    try {
        // 1. Fix Kanjirapally centers: extract location from center_name or address
        const [allCenters] = await db.query("SELECT center_id, center_name, address, location FROM tbl_collection_centers");

        let centerUpdates = 0;
        for (const c of allCenters) {
            const name = (c.center_name || '').toLowerCase();
            const addr = (c.address || '').toLowerCase();
            let newLocation = null;

            // Kanjirapally centers
            if (name.includes('kanjirapally') || addr.includes('kanjirapally')) {
                newLocation = 'kanjirapally';
            }
            // Kochi centers  
            else if (addr.includes('kochi') || addr.includes('ernakulam')) {
                newLocation = 'kochi';
            }
            // Trivandrum / TVM
            else if (addr.includes('trivandrum') || addr.includes('tvm') || addr.includes('vellayambalam') || addr.includes('kazhakkoottam') || addr.includes('anayara') || addr.includes('kesavadasapuram') || addr.includes('palayam')) {
                newLocation = 'trivandrum';
            }
            // Kollam
            else if (addr.includes('kollam') || name.includes('kollam') || addr.includes('chinnakada') || addr.includes('ashtamudi')) {
                newLocation = 'kollam';
            }
            // Pathanamthitta / Tiruvalla
            else if (addr.includes('pathanamthitta') || addr.includes('tiruvalla') || name.includes('pathanamthitta')) {
                newLocation = 'pathanamthitta';
            }
            // Alappuzha
            else if (addr.includes('alappuzha') || addr.includes('kuttanad') || addr.includes('cherthala') || name.includes('alappuzha')) {
                newLocation = 'alappuzha';
            }
            // Adoor / Konni (Pathanamthitta district)
            else if (addr.includes('adoor') || addr.includes('konni')) {
                newLocation = 'pathanamthitta';
            }
            // Attingal (Trivandrum district)
            else if (addr.includes('attingal') || name.includes('attingal')) {
                newLocation = 'trivandrum';
            }
            // Amal Jyothi (Kanjirapally campus)
            else if (name.includes('amal jyothi')) {
                newLocation = 'kanjirapally';
            }

            if (newLocation && newLocation !== (c.location || '').toLowerCase().trim()) {
                await db.query("UPDATE tbl_collection_centers SET location = ? WHERE center_id = ?", [newLocation, c.center_id]);
                centerUpdates++;
                console.log(`  ✅ Center ${c.center_id} (${c.center_name}): "${c.location}" → "${newLocation}"`);
            }
        }
        console.log(`\n🏢 Updated ${centerUpdates} center locations.\n`);

        // 2. Fix user locations from their pickup request addresses
        const [usersWithPickups] = await db.query(`
            SELECT DISTINCT u.user_id, u.name, u.location,
                   (SELECT r.address FROM tbl_pickup_requests r WHERE r.user_id = u.user_id AND r.address IS NOT NULL ORDER BY r.created_at DESC LIMIT 1) as latest_address
            FROM tbl_users u
            WHERE u.location IS NULL AND u.role = 'USER'
        `);

        let userUpdates = 0;
        for (const u of usersWithPickups) {
            if (!u.latest_address) continue;

            // Extract location from address pattern: "kanjirapally || SLOT:Morning"
            const addrParts = u.latest_address.split('||');
            const locationPart = addrParts[0].trim().toLowerCase();

            if (locationPart && locationPart.length > 2 && locationPart.length < 50) {
                await db.query("UPDATE tbl_users SET location = ? WHERE user_id = ?", [locationPart, u.user_id]);
                userUpdates++;
                console.log(`  ✅ User ${u.user_id} (${u.name}): null → "${locationPart}"`);
            }
        }
        console.log(`\n👤 Updated ${userUpdates} user locations.\n`);

        // 3. Verify the results
        const [verifyKanj] = await db.query(`
            SELECT center_id, center_name, location FROM tbl_collection_centers
            WHERE center_name LIKE '%kanjirapally%' OR center_name LIKE '%Kanjirapally%'
        `);
        console.log("Kanjirapally centers after fix:", verifyKanj);

        const [verifyUsers] = await db.query(`
            SELECT user_id, name, location FROM tbl_users WHERE user_id IN (7, 25, 26)
        `);
        console.log("Key users after fix:", verifyUsers);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixLocations();
