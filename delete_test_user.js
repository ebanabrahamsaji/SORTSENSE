import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sortsense_db'
};

async function deleteUser() {
    let connection;
    try {
        connection = await mysql.createConnection(config);
        const email = "davidjohn2028@mca.ajce.in";
        const [result] = await connection.query("DELETE FROM tbl_users WHERE email = ?", [email]);
        console.log(`Deleted user ${email}. Rows affected: ${result.affectedRows}`);
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        if (connection) await connection.end();
    }
}

deleteUser();
