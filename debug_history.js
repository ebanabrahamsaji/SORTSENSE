
import db from './db.js';

(async () => {
    try {
        const [users] = await db.query('SELECT user_id FROM tbl_users LIMIT 1');
        if (users.length === 0) { console.log("No users found"); process.exit(); }

        const uid = users[0].user_id; // Using first user
        console.log(`Inserting scan for User ${uid}`);

        await db.query("INSERT INTO tbl_user_history (user_id, activity_type, details) VALUES (?, 'SCAN', ?)",
            [uid, JSON.stringify({ category: 'Plastic', result: 'Test Bottle', confidence: 99 })]);

        console.log("Inserted. Checking count...");
        const [rows] = await db.query('SELECT * FROM tbl_user_history');
        console.log(`Total History Records: ${rows.length}`);

    } catch (e) {
        console.error(e);
    }
    process.exit();
})();
