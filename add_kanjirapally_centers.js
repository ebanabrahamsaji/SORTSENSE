
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'SortSense@2025',
    database: process.env.DB_NAME || 'sortsense_db'
});

async function seedData() {
    try {
        console.log("Adding Kanjirapally Centers...");

        // Kanjirapally Centers (Lat: 9.5549, Lng: 76.7902)
        const centers = [
            ['Kanjirapally Plastic MCF', 'plastic', 9.5550, 76.7910, 'Near Private Bus Stand, Kanjirapally', '04828-202020'],
            ['St. Dominics College E-Waste Drop', 'ewaste', 9.5600, 76.7950, 'Parathode, Kanjirapally', '04828-203030'],
            ['Erumely Organic Plant', 'organic', 9.4800, 76.8400, 'Erumely Town', '04828-212121'],
            ['Ponkunnam Scrap Yard', 'metal', 9.5700, 76.7700, 'Ponkunnam', '04828-222222'],
            ['Mundakayam Glass Recyclers', 'glass', 9.5300, 76.8800, 'Mundakayam', '04828-232323']
        ];

        for (const c of centers) {
            // Check existence
            const [rows] = await pool.query('SELECT id FROM collection_centers WHERE name = ?', [c[0]]);
            if (rows.length === 0) {
                await pool.query(
                    'INSERT INTO collection_centers (name, category, latitude, longitude, address, phone) VALUES (?, ?, ?, ?, ?, ?)',
                    c
                );
                console.log(`Added: ${c[0]}`);
            } else {
                console.log(`Skipped (Exists): ${c[0]}`);
            }
        }

        console.log("Done!");
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedData();
