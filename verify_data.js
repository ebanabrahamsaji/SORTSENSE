import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'sortsense_db'
};

async function verify() {
    console.log("🔍 Verifying Data...");
    try {
        const conn = await mysql.createConnection(config);

        // Count
        const [rows] = await conn.query('SELECT COUNT(*) as c FROM tbl_collection_centers');
        console.log(`Total Centers: ${rows[0].c}`);

        // Check E-waste types
        const [eRows] = await conn.query(`SELECT center_name, type FROM tbl_collection_centers WHERE type IN ('ewaste', 'recycler') OR type LIKE '%scrap%' LIMIT 10`);
        console.log("Sample E-waste/Scrap Centers:", eRows);

        await conn.end();
    } catch (e) {
        console.error(e);
    }
}
verify();
