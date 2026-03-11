import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sortsense_db'
};

async function deleteTestUsers() {
    let connection;
    try {
        connection = await mysql.createConnection(config);

        // Define patterns for test users
        const testEmails = [
            'davidjohn2028@mca.ajce.in',
            'davidjohn_test1773054710137@mca.ajce.in',
            'test_bot@example.com',
            'test_ujxux@example.com',
            'test_hgwsr@example.com',
            'test_dctyt@example.com',
            'test_tlsty@example.com'
        ];

        console.log("🚀 Starting deletion of test users...");

        // Delete by exact email matches
        const [res1] = await connection.query("DELETE FROM tbl_users WHERE email IN (?)", [testEmails]);
        console.log(`✅ Deleted ${res1.affectedRows} users by exact email match.`);

        // Delete by patterns (email contains 'test' or 'example.com')
        const [res2] = await connection.query("DELETE FROM tbl_users WHERE email LIKE '%test%' OR email LIKE '%example.com%' OR name LIKE '%Test%'");
        console.log(`✅ Deleted ${res2.affectedRows} users by pattern match (test/example.com).`);

        console.log("✨ Cleanup complete.");
    } catch (err) {
        console.error("❌ Error during cleanup:", err.message);
    } finally {
        if (connection) await connection.end();
    }
}

deleteTestUsers();
