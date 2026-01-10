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
        { category_id: 7, category_name: 'Hazardous', description: 'Medical and chemical waste.' }
    ],
    waste_items: [
        { item_id: 1, category_id: 1, item_name: 'Plastic Bottle', disposal_guideline: 'Wash, dry, and squash.', safety_instructions: 'Do not burn.' },
        { item_id: 2, category_id: 2, item_name: 'Glass Jar', disposal_guideline: 'Rinse thoroughly.', safety_instructions: 'Wrap broken glass.' },
        { item_id: 3, category_id: 5, item_name: 'Battery', disposal_guideline: 'Hand over to e-waste centers.', safety_instructions: 'Do not dismantle.' }
    ],
    images: []
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

        // 6. Image Upload Record
        if (lowerSql.includes('insert into tbl_item_images')) {
            mockData.images.push({ user_id: params[0], item_id: params[1], url: params[2] });
            return [{ insertId: 1 }];
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
