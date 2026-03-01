import db from './db.js';

async function verifySync() {
    try {
        console.log("--- STEP 1 & 2: Checking centers table status ---");
        const [centers] = await db.query("SELECT center_id, center_name, is_online, last_seen FROM tbl_collection_centers");

        console.table(centers);

        if (centers.length > 0) {
            const firstCenterId = centers[0].center_id;
            console.log(`\n--- STEP 3: Manually updating center ${firstCenterId} to online ---`);
            await db.query("UPDATE tbl_collection_centers SET is_online = 1, last_seen = NOW() WHERE center_id = ?", [firstCenterId]);

            const [afterUpdate] = await db.query("SELECT center_id, center_name, is_online, last_seen, TIMESTAMPDIFF(SECOND, last_seen, NOW()) as diff_sec FROM tbl_collection_centers WHERE center_id = ?", [firstCenterId]);
            console.table(afterUpdate);

            if (afterUpdate[0].is_online === 1) {
                console.log("✅ Manual update successful.");
            } else {
                console.error("❌ Manual update failed to set is_online to 1.");
            }
        }
        process.exit(0);
    } catch (err) {
        console.error("Verification failed:", err);
        process.exit(1);
    }
}

verifySync();
