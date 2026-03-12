import mysql from 'mysql2/promise';
(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sortsense_db'
    });
    try {
        console.log("🧹 Clearing tbl_user_center_messages for a clean test...");
        const [result] = await db.query("TRUNCATE TABLE tbl_user_center_messages");
        console.log("✅ Chat history cleared successfully.");
    } catch (e) {
        console.error("❌ Error clearing history:", e);
    } finally {
        await db.end();
        process.exit(0);
    }
})();
