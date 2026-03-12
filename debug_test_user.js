import db from './db.js';

async function checkUserAndPickups() {
    try {
        const email = 'ebanabraham28@gmail.com';
        const [users] = await db.query("SELECT * FROM tbl_users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            console.log("❌ User not found");
            process.exit(1);
        }

        const user = users[0];
        console.log(`👤 User Found: ID=${user.user_id}, Name=${user.name}, Role=${user.role}`);

        const [pickups] = await db.query("SELECT * FROM tbl_pickup_requests WHERE user_id = ? ORDER BY created_at DESC", [user.user_id]);
        console.log(`📦 Pickups Found: ${pickups.length}`);
        pickups.forEach(p => {
            console.log(`   - ID=${p.request_id}, Status=${p.status}, CenterID=${p.center_id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

checkUserAndPickups();
