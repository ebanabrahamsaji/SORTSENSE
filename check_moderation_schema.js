import db from './db.js';

async function checkModerationSchema() {
    try {
        console.log("--- tbl_users schema ---");
        const [userCols] = await db.query("SHOW COLUMNS FROM tbl_users");
        console.log("Columns:", userCols.map(c => c.Field).join(', '));

        console.log("\n--- Checking for tbl_moderation_logs ---");
        const [tables] = await db.query("SHOW TABLES LIKE 'tbl_moderation_logs'");
        if (tables.length > 0) {
            const [modCols] = await db.query("SHOW COLUMNS FROM tbl_moderation_logs");
            console.log("tbl_moderation_logs exists. Columns:", modCols.map(c => c.Field).join(', '));
        } else {
            console.log("tbl_moderation_logs does NOT exist.");
        }

        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

checkModerationSchema();
