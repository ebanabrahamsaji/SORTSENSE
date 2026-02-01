import db from './db.js';

async function fixUser() {
    try {
        const email = 'kevindaniel2028@mca.ajce.in';
        const [users] = await db.query("SELECT * FROM tbl_users WHERE email = ?", [email]);

        if (users.length > 0) {
            console.log(`Found user ${email}. Deleting...`);
            await db.query("DELETE FROM tbl_users WHERE email = ?", [email]);
            console.log("User deleted. You can now create this user again.");
        } else {
            console.log(`User ${email} does not exist.`);
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

fixUser();
