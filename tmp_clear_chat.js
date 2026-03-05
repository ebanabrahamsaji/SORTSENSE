import db from './db.js';

async function clearChatHistory() {
    try {
        console.log("🧹 Clearing chat history from tbl_user_center_messages...");
        const [result] = await db.query("DELETE FROM tbl_user_center_messages");
        console.log(`✅ Success! Deleted ${result.affectedRows} messages.`);
    } catch (e) {
        console.error("❌ Error clearing chat history:", e);
    }
    process.exit();
}

clearChatHistory();
