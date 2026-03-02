import db from './db.js';
import fs from 'fs';

(async () => {
    try {
        const [rows] = await db.query("DESCRIBE tbl_user_center_messages");
        fs.writeFileSync("schema_output.json", JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit(0);
})();
