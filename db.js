import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// --- Configuration ---
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sortsense_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// --- Mock Database (In-Memory) ---
const mockData = {
    users: [],
    categories: [
        { category_id: 1, category_name: 'Plastic', description: 'All types of rigid and flexible plastics.' },
        { category_id: 2, category_name: 'Glass', description: 'Bottles, jars, and broken glass.' },
        { category_id: 3, category_name: 'Metal', description: 'Cans, foils, and metal scraps.' },
        { category_id: 4, category_name: 'Organic', description: 'Food waste and biodegradable matter.' },
        { category_id: 5, category_name: 'E-waste', description: 'Electronic gadgets and batteries.' },
        { category_id: 6, category_name: 'Paper', description: 'Newspapers and cardboard.' },
        { category_id: 7, category_name: 'Hazardous', description: 'Medical and chemical waste.' },
        { category_id: 8, category_name: 'Textile', description: 'Old clothes and fabric.' }
    ],
    waste_items: [
        { item_id: 1, category_id: 1, item_name: 'Plastic Bottle', disposal_guideline: 'Wash, dry, and squash.', safety_instructions: 'Do not burn.' },
        { item_id: 2, category_id: 2, item_name: 'Glass Jar', disposal_guideline: 'Rinse thoroughly.', safety_instructions: 'Wrap broken glass.' },
        { item_id: 3, category_id: 5, item_name: 'Battery', disposal_guideline: 'Hand over to e-waste centers.', safety_instructions: 'Do not dismantle.' }
    ],
    images: [],
    collection_centers: [
        { center_id: 1, center_name: 'Kochi Corporation Bio-Plant', type: 'Organic', latitude: 9.969248, longitude: 76.270523, address: 'Brahmapuram, Kochi, Kerala' },
        { center_id: 2, center_name: 'CleanKerala MCF Edappally', type: 'Plastic', latitude: 10.026676, longitude: 76.308777, address: 'Edappally Toll, Kochi' },
        { center_id: 3, center_name: 'E-Safe Recycling Hub', type: 'E-waste', latitude: 9.982000, longitude: 76.290000, address: 'Palarivattom, Kochi' },
        { center_id: 4, center_name: 'GreenScrap Metal Traders', type: 'Metal', latitude: 9.950000, longitude: 76.260000, address: 'Pallimukku, Kochi' },
        { center_id: 5, center_name: 'Glass Reuse Center', type: 'Glass', latitude: 10.010000, longitude: 76.320000, address: 'Kakkanad, Kochi' },
        { center_id: 6, center_name: 'HazSafe Medical Disposal', type: 'Hazardous', latitude: 10.050000, longitude: 76.350000, address: 'Kalamassery, Kochi' },
        { center_id: 7, center_name: 'Trivandrum Smart Dump', type: 'General', latitude: 8.524139, longitude: 76.936638, address: 'Palayam, Trivandrum' },
        { center_id: 8, center_name: 'Kottayam Eco-Collection Hub', type: 'General', latitude: 9.591566, longitude: 76.522156, address: 'Kottayam Town, Kerala' },
        { center_id: 9, center_name: 'Kottayam Medical College', type: 'Hazardous', latitude: 9.619056, longitude: 76.554032, address: 'Gandhinagar, Kottayam' },
        { center_id: 10, center_name: 'Erumely E-Waste Drop', type: 'E-waste', latitude: 9.479500, longitude: 76.786500, address: 'Erumely Town' },
        { center_id: 11, center_name: 'KSEB Section Office', type: 'KSEB', latitude: 9.580000, longitude: 76.520000, address: 'Kottayam' },
        { center_id: 12, center_name: 'Rahul Scrap & Electronics', type: 'Scrap', latitude: 10.030000, longitude: 76.310000, address: 'Edappally' },
        { center_id: 13, center_name: 'City Mobile & Laptop Care', type: 'Electronics', latitude: 9.970000, longitude: 76.280000, address: 'MG Road, Kochi' },
        { center_id: 14, center_name: 'Town Scrap Yard', type: 'Scrap', latitude: 9.940000, longitude: 76.260000, address: 'Vyttila, Kochi' },
        { center_id: 15, center_name: 'Lulu Connect E-Bin', type: 'Electronics', latitude: 10.027000, longitude: 76.308000, address: 'Lulu Mall' },
        { center_id: 16, center_name: 'District General Hospital', type: 'Hospital', latitude: 9.970000, longitude: 76.280000, address: 'Ernakulam' },
        { center_id: 17, center_name: 'Hope Charity Foundation', type: 'Charity', latitude: 9.965000, longitude: 76.290000, address: 'Palarivattom' },
        { center_id: 18, center_name: 'City Thrift Store', type: 'Thrift', latitude: 10.010000, longitude: 76.330000, address: 'Kakkanad' },
        { center_id: 19, center_name: 'Northamps Env Solution', type: 'E-waste', latitude: 9.594000, longitude: 76.525000, address: 'Muttambalam, Kottayam' },
        { center_id: 20, center_name: 'Techazar Electronics', type: 'Electronics', latitude: 9.585000, longitude: 76.530000, address: 'Kottayam Town' },
        { center_id: 21, center_name: 'Greenbhoomi Recyclers', type: 'Recycler', latitude: 9.600000, longitude: 76.510000, address: 'Kodimatha, Kottayam' },
        { center_id: 22, center_name: 'E-Waste Kiliroor', type: 'E-waste', latitude: 9.620000, longitude: 76.490000, address: 'Kiliroor, Kottayam' },
        { center_id: 23, center_name: 'Spice Route Ventures', type: 'E-waste', latitude: 9.570000, longitude: 76.540000, address: 'Kanjikuzhy, Kottayam' },
        { center_id: 24, center_name: 'HKS Unit Kottayam', type: 'HKS', latitude: 9.590000, longitude: 76.520000, address: 'Kottayam' },
        // Kanjirapally Centers
        { center_id: 25, center_name: 'Kanjirapally Plastic MCF', type: 'Plastic', latitude: 9.5550, longitude: 76.7910, address: 'Near Private Bus Stand, Kanjirapally' },
        { center_id: 26, center_name: 'St. Dominics College E-Waste Drop', type: 'E-waste', latitude: 9.5600, longitude: 76.7950, address: 'Parathode, Kanjirapally' },
        { center_id: 27, center_name: 'Erumely Organic Plant', type: 'Organic', latitude: 9.4800, longitude: 76.8400, address: 'Erumely Town' },
        { center_id: 28, center_name: 'Ponkunnam Scrap Yard', type: 'Metal', latitude: 9.5700, longitude: 76.7700, address: 'Ponkunnam' },
        { center_id: 29, center_name: 'Mundakayam Glass Recyclers', type: 'Glass', latitude: 9.5300, longitude: 76.8800, address: 'Mundakayam' }
    ]
};

class MockPool {
    async query(sql, params) {
        // console.log("⚠️ [MockDB] Query:", sql, params); // Debug log
        const lowerSql = sql.toLowerCase();

        // 1. Auth: INSERT User
        if (lowerSql.includes('insert into tbl_users')) {
            const newUser = {
                user_id: mockData.users.length + 1,
                name: params[0],
                email: params[1],
                password_hash: params[2],
                language_pref: params[3]
            };
            mockData.users.push(newUser);
            return [{ insertId: newUser.user_id }];
        }

        // 2. Auth: SELECT User (Login / Forgot)
        if (lowerSql.includes('select * from tbl_users')) {
            const email = params[0];
            const user = mockData.users.find(u => u.email === email);
            return [user ? [user] : []];
        }

        // 3. Auth: UPDATE User (Reset Password)
        if (lowerSql.includes('update tbl_users')) {
            const email = params[1];
            const user = mockData.users.find(u => u.email === email);
            if (user) {
                user.password_hash = params[0];
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 4. Waste: SELECT Categories
        if (lowerSql.includes('select * from tbl_categories')) {
            return [mockData.categories];
        }

        // 5. Waste: Identify/Details (LIKE search)
        if (lowerSql.includes('from tbl_categories c')) {
            // Simplified return for any category search
            // We return a generic safe response based on the search term in params
            const searchTerm = params[0].replace('%', '').replace('%', ''); // remove wildcards
            const cat = mockData.categories.find(c => c.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
                || mockData.categories[0]; // fallback

            const item = mockData.waste_items.find(i => i.category_id === cat.category_id);

            const row = {
                description: cat.description,
                disposal_guideline: item ? item.disposal_guideline : 'Dispose responsibly.',
                safety_instructions: item ? item.safety_instructions : 'Handle with care.'
            };
            return [[row]];
        }

        if (lowerSql.includes('insert into tbl_item_images')) {
            mockData.images.push({ user_id: params[0], item_id: params[1], url: params[2] });
            return [{ insertId: 1 }];
        }

        // 7. Centers: SELECT (All or Filtered)
        if (lowerSql.includes('tbl_collection_centers')) {
            let results = mockData.collection_centers;

            // Enhanced Mock Filter logic
            if (lowerSql.includes('where')) {
                const keyword = params[0] ? params[0].replace('%', '').replace('%', '').toLowerCase() : '';

                results = results.filter(c => {
                    const t = c.type.toLowerCase();
                    const n = c.center_name.toLowerCase();

                    if (t.includes('hks')) return true; // Always include HKS

                    if (keyword === 'plastic') return t.includes('plastic') || t.includes('scrap') || n.includes('mcf');
                    if (keyword === 'glass') return t.includes('glass') || t.includes('scrap');
                    if (keyword === 'metal') return t.includes('metal') || t.includes('scrap');
                    if (keyword === 'e-waste' || keyword === 'ewaste') return t.includes('e-waste') || t.includes('scrap') || t.includes('electronics') || t.includes('kseb') || n.includes('mobile');
                    if (keyword === 'hazardous') return t.includes('hazardous') || t.includes('hospital') || n.includes('health') || t.includes('hks');
                    if (keyword === 'organic') return t.includes('organic') || n.includes('compost');
                    if (keyword === 'paper') return t.includes('paper') || t.includes('scrap') || t.includes('recycling');
                    if (keyword === 'textile' || keyword === 'cloth') return t.includes('charity') || t.includes('thrift') || t.includes('donation') || t.includes('scrap');

                    // Fallback
                    return t.includes(keyword) || n.includes(keyword) || t === 'general';
                });
            }
            return [results];
        }

        // Default empty
        return [[], []];
    }

    async getConnection() {
        return {
            release: () => { },
            query: this.query.bind(this),
            beginTransaction: () => { },
            commit: () => { },
            rollback: () => { }
        };
    }
}

// --- Hybrid Pool ---
let pool = mysql.createPool(dbConfig);
let isMock = false;

// Wrapper to intercept queries and switch to mock on error
const smartPool = {
    async query(sql, params) {
        try {
            if (isMock) return await new MockPool().query(sql, params);
            return await pool.query(sql, params);
        } catch (error) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ER_NOT_SUPPORTED_AUTH_MODE') {
                if (!isMock) {
                    console.warn(`\n⚠️  MYSQL CONNECTION FAILED (${error.code}). SWITCHING TO MOCK DATABASE.\n    App will function normally using in-memory data.\n`);
                    isMock = true;
                }
                return await new MockPool().query(sql, params);
            }
            throw error;
        }
    },
    async getConnection() {
        try {
            if (isMock) return await new MockPool().getConnection();
            return await pool.getConnection();
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                isMock = true;
                console.warn(`\n⚠️  MYSQL CONNECTION FAILED. USING MOCK DB.\n`);
                return await new MockPool().getConnection();
            }
            throw error;
        }
    }
};

// Initial Test
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Connected to MySQL Database (Live)');
        conn.release();
    } catch (e) {
        isMock = true;
        console.log(`⚠️  MySQL Unreachable (${e.code}). Mock Database Enabled.`);
    }
})();

export default smartPool;
