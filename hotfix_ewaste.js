import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'sortsense_db'
};

async function hotfix() {
    console.log("🔥 Applying Hotfix for Ewaste (No Hyphen)...");
    let conn;
    try {
        conn = await mysql.createConnection(config);

        // 1. Ensure 'Ewaste' category exists (to match user query 'Ewaste')
        console.log("Checking 'Ewaste' category...");
        await conn.query(`INSERT IGNORE INTO tbl_categories (category_name, description) VALUES ('Ewaste', 'Electronic waste (Hotfix for typo)')`);

        // 2. Get IDs
        const [rows] = await conn.query(`SELECT category_id, category_name FROM tbl_categories WHERE category_name IN ('E-waste', 'Ewaste')`);
        const ewasteHyphen = rows.find(r => r.category_name === 'E-waste')?.category_id;
        const ewasteNoHyphen = rows.find(r => r.category_name === 'Ewaste')?.category_id;

        if (ewasteHyphen && ewasteNoHyphen) {
            console.log(`Mapping E-waste (${ewasteHyphen}) centers to Ewaste (${ewasteNoHyphen})...`);

            // 3. Copy mappings: Find all centers mapped to E-waste (Hyphen) and map them to Ewaste (No Hyphen)
            // Actually, let's just use the logic from the seed but for the new ID.

            // Select relevant centers based on our normalized types
            // types: ewaste, scrap, recycler, electronics_shop, kseb, mcf, hks
            const [centers] = await conn.query(`
                SELECT center_id FROM tbl_collection_centers 
                WHERE type IN ('ewaste', 'scrap', 'recycler', 'electronics_shop', 'kseb', 'mcf', 'hks', 'general')
            `);

            console.log(`Found ${centers.length} valid E-waste centers to link.`);

            for (const c of centers) {
                await conn.query(`INSERT IGNORE INTO tbl_accepted_categories (center_id, category_id) VALUES (?, ?)`, [c.center_id, ewasteNoHyphen]);
                // Ensure they are also linked to the hyphenated one just in case
                await conn.query(`INSERT IGNORE INTO tbl_accepted_categories (center_id, category_id) VALUES (?, ?)`, [c.center_id, ewasteHyphen]);
            }
            console.log("✅ Links updated.");
        } else {
            console.error("Could not find category IDs");
        }

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        if (conn) await conn.end();
    }
}

hotfix();
