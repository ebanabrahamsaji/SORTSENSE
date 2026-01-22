import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Adjust if needed
    database: process.env.DB_NAME || 'sortsense_db'
};

async function seed() {
    console.log('🌱 Seeding Admin and Center users...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);

        // 1. Admin
        const adminName = 'Admin';
        const adminEmail = 'admin@sortsense.com';

        // Check if exists
        const [admins] = await connection.query('SELECT * FROM tbl_users WHERE role = ?', ['ADMIN']);
        if (admins.length === 0) {
            await connection.query(
                'INSERT INTO tbl_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [adminName, adminEmail, hash, 'ADMIN']
            );
            console.log(`✅ Created Admin User: Username="${adminName}", Pass="${password}"`);
        } else {
            console.log('ℹ️ Admin user already exists.');
        }

        // 2. Center
        const centerName = 'Center';
        const centerEmail = 'center@sortsense.com';

        const [centers] = await connection.query('SELECT * FROM tbl_users WHERE role = ?', ['CENTER']);
        if (centers.length === 0) {
            await connection.query(
                'INSERT INTO tbl_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [centerName, centerEmail, hash, 'CENTER']
            );
            console.log(`✅ Created Center User: Username="${centerName}", Pass="${password}"`);
        } else {
            console.log('ℹ️ Center user already exists.');
        }

        // 3. User
        const userName = 'User';
        const userEmail = 'user@sortsense.com';

        const [users] = await connection.query('SELECT * FROM tbl_users WHERE email = ?', [userEmail]);
        if (users.length === 0) {
            await connection.query(
                'INSERT INTO tbl_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [userName, userEmail, hash, 'USER']
            );
            console.log(`✅ Created Normal User: Email="${userEmail}", Pass="${password}"`);
        } else {
            console.log('ℹ️ Normal user already exists.');
        }

    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
