import db from './db.js';

(async () => {
    try {
        const [rows] = await db.query("DESCRIBE tbl_user_center_messages");
        console.log("SCHEMA tbl_user_center_messages:", rows);
    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit(0);
})();
