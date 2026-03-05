import db from './db.js';

async function run() {
    try {
        console.log("Updating to fix corrupt messages...");
        // Make sure messages 18, 20 are user
        await db.query("UPDATE tbl_user_center_messages SET sender_id=25, sender_role='user', receiver_id=690, receiver_role='center' WHERE message_id IN (18, 20)");

        // Make sure messages 21, 22, 23 are center
        await db.query("UPDATE tbl_user_center_messages SET sender_id=690, sender_role='center', receiver_id=25, receiver_role='user' WHERE message_id IN (21, 22, 23)");

        // Make 24 sent by user.
        await db.query("UPDATE tbl_user_center_messages SET sender_id=25, sender_role='user', receiver_id=690, receiver_role='center' WHERE message_id=24");

        console.log("Done");
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
run();
