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
    users: [
        { user_id: 1, name: 'Admin Demo', email: 'admin@sortsense.com', role: 'ADMIN', status: 'active' },
        { user_id: 2, name: 'John User', email: 'user@sortsense.com', role: 'USER', status: 'active', eco_points: 120, total_scans: 5 },
        { user_id: 3, name: 'HKS Manager', email: 'hks@sortsense.com', role: 'CENTER', status: 'active', center_id: 25 }
    ],
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
    waste_records: [
        { record_id: 1, user_id: 1, user_name: 'Admin Demo', user_email: 'admin@sortsense.com', waste_type: 'Plastic Bottle', category: 'Plastic', weight: 1.2, quantity: 2, location: 'Kochi', scan_method: 'SCAN', status: 'Scanned', created_at: new Date() }
    ],
    collection_centers: [
        { center_id: 1, center_name: 'Kochi Corporation Bio-Plant', type: 'Organic', latitude: 9.969248, longitude: 76.270523, address: 'Brahmapuram, Kochi, Kerala', status: 'OPEN', available_slots: 8, max_slots: 20, is_primary: false },
        { center_id: 2, center_name: 'CleanKerala MCF Edappally', type: 'Plastic', latitude: 10.026676, longitude: 76.308777, address: 'Edappally Toll, Kochi', status: 'OPEN', available_slots: 15, max_slots: 20, is_primary: false },
        { center_id: 3, center_name: 'E-Safe Recycling Hub', type: 'E-waste', latitude: 9.982000, longitude: 76.290000, address: 'Palarivattom, Kochi', status: 'OPEN', available_slots: 5, max_slots: 10, is_primary: false },
        { center_id: 4, center_name: 'GreenScrap Metal Traders', type: 'Metal', latitude: 9.950000, longitude: 76.260000, address: 'Pallimukku, Kochi', status: 'OPEN', available_slots: 10, max_slots: 15, is_primary: false },
        { center_id: 5, center_name: 'Glass Reuse Center', type: 'Glass', latitude: 10.010000, longitude: 76.320000, address: 'Kakkanad, Kochi', status: 'OPEN', available_slots: 2, max_slots: 10, is_primary: false },
        { center_id: 6, center_name: 'HazSafe Medical Disposal', type: 'Hazardous', latitude: 10.050000, longitude: 76.350000, address: 'Kalamassery, Kochi', status: 'OPEN', available_slots: 20, max_slots: 50, is_primary: false },
        { center_id: 7, center_name: 'Trivandrum Smart Dump', type: 'General', latitude: 8.524139, longitude: 76.936638, address: 'Palayam, Trivandrum', status: 'OPEN', available_slots: 30, max_slots: 40, is_primary: false },
        { center_id: 8, center_name: 'Kottayam Eco-Collection Hub', type: 'General', address: 'Kottayam Town, Kerala', status: 'OPEN', center_status: 'online', available_slots: 10, max_slots: 20, is_primary: false },
        { center_id: 9, center_name: 'Kottayam Medical College', type: 'Hazardous', address: 'Gandhinagar, Kottayam', status: 'OPEN', center_status: 'online', available_slots: 4, max_slots: 10, is_primary: false },
        { center_id: 10, center_name: 'Erumely E-Waste Drop', type: 'E-waste', address: 'Erumely Town', status: 'OPEN', center_status: 'online', available_slots: 8, max_slots: 10, is_primary: false },
        { center_id: 11, center_name: 'KSEB Section Office', type: 'KSEB', address: 'Kottayam', status: 'OPEN', center_status: 'online', available_slots: 12, max_slots: 15, is_primary: false },
        { center_id: 12, center_name: 'Rahul Scrap & Electronics', type: 'Scrap', latitude: 10.030000, longitude: 76.310000, address: 'Edappally', status: 'OPEN', available_slots: 6, max_slots: 10, is_primary: false },
        { center_id: 13, center_name: 'City Mobile & Laptop Care', type: 'Electronics', latitude: 9.970000, longitude: 76.280000, address: 'MG Road, Kochi', status: 'OPEN', available_slots: 0, max_slots: 5, is_primary: false }, // Full example
        { center_id: 14, center_name: 'Town Scrap Yard', type: 'Scrap', latitude: 9.940000, longitude: 76.260000, address: 'Vyttila, Kochi', status: 'OPEN', available_slots: 8, max_slots: 15, is_primary: false },
        { center_id: 15, center_name: 'Lulu Connect E-Bin', type: 'Electronics', latitude: 10.027000, longitude: 76.308000, address: 'Lulu Mall', status: 'OPEN', available_slots: 25, max_slots: 30, is_primary: false },
        { center_id: 16, center_name: 'District General Hospital', type: 'Hospital', latitude: 9.970000, longitude: 76.280000, address: 'Ernakulam', status: 'OPEN', available_slots: 5, max_slots: 20, is_primary: false },
        { center_id: 17, center_name: 'Hope Charity Foundation', type: 'Charity', latitude: 9.965000, longitude: 76.290000, address: 'Palarivattom', status: 'OPEN', available_slots: 10, max_slots: 20, is_primary: false },
        { center_id: 18, center_name: 'City Thrift Store', type: 'Thrift', latitude: 10.010000, longitude: 76.330000, address: 'Kakkanad', status: 'OPEN', available_slots: 8, max_slots: 10, is_primary: false },
        { center_id: 19, center_name: 'Northamps Env Solution', type: 'E-waste', latitude: 9.594000, longitude: 76.525000, address: 'Muttambalam, Kottayam', status: 'OPEN', available_slots: 3, max_slots: 10, is_primary: false },
        { center_id: 20, center_name: 'Techazar Electronics', type: 'Electronics', latitude: 9.585000, longitude: 76.530000, address: 'Kottayam Town', status: 'CLOSED', available_slots: 0, max_slots: 10, is_primary: false }, // Closed example
        { center_id: 21, center_name: 'Greenbhoomi Recyclers', type: 'Recycler', latitude: 9.600000, longitude: 76.510000, address: 'Kodimatha, Kottayam', status: 'OPEN', available_slots: 15, max_slots: 20 },
        { center_id: 22, center_name: 'E-Waste Kiliroor', type: 'E-waste', latitude: 9.620000, longitude: 76.490000, address: 'Kiliroor, Kottayam', status: 'OPEN', available_slots: 5, max_slots: 10 },
        { center_id: 23, center_name: 'Spice Route Ventures', type: 'E-waste', latitude: 9.570000, longitude: 76.540000, address: 'Kanjikuzhy, Kottayam', status: 'OPEN', available_slots: 7, max_slots: 10 },
        { center_id: 24, center_name: 'HKS Unit Kottayam', type: 'HKS', latitude: 9.590000, longitude: 76.520000, address: 'Kottayam', status: 'OPEN', available_slots: 10, max_slots: 20 },
        // Kanjirapally Centers
        { center_id: 25, center_name: 'Kanjirapally Plastic MCF', type: 'Plastic', latitude: 9.5550, longitude: 76.7910, address: 'Near Private Bus Stand, Kanjirapally', status: 'OPEN', available_slots: 10, max_slots: 10, center_status: 'offline', last_active_time: null, center_performance_score: 100 },
        { center_id: 26, center_name: 'St. Dominics College E-Waste Drop', type: 'E-waste', latitude: 9.5600, longitude: 76.7950, address: 'Parathode, Kanjirapally', status: 'OPEN', available_slots: 10, max_slots: 10, center_status: 'offline', last_active_time: null, center_performance_score: 100 },
        { center_id: 27, center_name: 'Erumely Organic Plant', type: 'Organic', latitude: 9.4800, longitude: 76.8400, address: 'Erumely Town', status: 'OPEN', available_slots: 5, max_slots: 10, center_status: 'offline', last_active_time: null, center_performance_score: 100 },
        { center_id: 28, center_name: 'Ponkunnam Scrap Yard', type: 'Metal', latitude: 9.5700, longitude: 76.7700, address: 'Ponkunnam', status: 'OPEN', available_slots: 8, max_slots: 10, center_status: 'offline', last_active_time: null, center_performance_score: 100 },
        { center_id: 29, center_name: 'Mundakayam Glass Recyclers', type: 'Glass', latitude: 9.5300, longitude: 76.8800, address: 'Mundakayam', status: 'OPEN', available_slots: 2, max_slots: 10, center_status: 'offline', last_active_time: null, center_performance_score: 100 }
    ],
    marketplace: [
        { item_id: 1, user_id: 1, title: 'Clean Plastic Bottles', category: 'Plastic', description: 'Clear PET bottles, washed and dried.', created_at: new Date(Date.now() - 3600000), owner_name: 'Mathew', image_url: 'https://images.unsplash.com/photo-1558449028-08571068832a?auto=format&fit=crop&q=80&w=800', status: 'active' },
        { item_id: 2, user_id: 1, title: 'Cardboard Boxes', category: 'Paper', description: 'Flattened shipping boxes for reuse.', created_at: new Date(Date.now() - 7200000), owner_name: 'John', image_url: 'https://images.unsplash.com/photo-1513061397548-5224286289d7?auto=format&fit=crop&q=80&w=800', status: 'active' },
        { item_id: 3, user_id: 1, title: 'Glass Bottles & Jars', category: 'Glass', description: 'Mixed glass containers for projects.', created_at: new Date(Date.now() - 10800000), owner_name: 'Binn', image_url: 'https://images.unsplash.com/photo-1621405108846-9f8841a0e88a?auto=format&fit=crop&q=80&w=800', status: 'active' },
        { item_id: 4, user_id: 1, title: 'Aluminum Soda Cans', category: 'Metal', description: 'Empty soda cans, bulk quantity.', created_at: new Date(Date.now() - 172800000), owner_name: 'Alex', image_url: 'https://images.unsplash.com/photo-1600511213386-89d15c7e0f21?auto=format&fit=crop&q=80&w=800', status: 'active' },
        { item_id: 5, user_id: 1, title: 'Scrap Copper Wires', category: 'Metal', description: 'High-grade copper for recycling.', created_at: new Date(Date.now() - 86400000), owner_name: 'Don', image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&q=80&w=800', status: 'active' },
        { item_id: 6, user_id: 1, title: 'Old Laptop Spare Parts', category: 'E-Waste', description: 'Components for electronic hobbyists.', created_at: new Date(Date.now() - 259200000), owner_name: 'Sarah', image_url: 'https://images.unsplash.com/photo-1593642532454-e138e28a63f4?auto=format&fit=crop&q=80&w=800', status: 'active' }
    ],
    special_waste: [
        { request_id: 101, user_id: 2, category: 'Bulk', quantity_value: 1000, quantity_unit: 'kg', location: 'Startup Valley TBI...', status: 'Approved', center_id: null, created_at: new Date() },
        { request_id: 102, user_id: 2, category: 'Festival', quantity_value: 45, quantity_unit: 'kg', location: 'Startup Valley TBI...', status: 'Approved', center_id: null, created_at: new Date() }
    ],
    user_history: [
        { history_id: 1, user_id: 2, activity_type: 'SCAN', details: { category: 'Plastic Bottle', confidence: 98, result: 'Recyclable' }, created_at: new Date(Date.now() - 86400000) },
        { history_id: 2, user_id: 2, activity_type: 'SEARCH', details: { query: 'battery disposal' }, created_at: new Date(Date.now() - 172800000) },
        { history_id: 3, user_id: 1, activity_type: 'SCAN', details: { category: 'Glass Jar', confidence: 95 }, created_at: new Date() }
    ],
    marketplace_messages: [],
    center_messages: [],
    user_center_messages: [],
    pickup_requests: [
        { request_id: 60, user_id: 2, waste_type: 'Plastic', quantity: 10.00, address: 'Kochi, Kerala', center_id: 2, status: 'Approved', created_at: new Date('2026-02-22T10:00:00') },
        { request_id: 61, user_id: 2, waste_type: 'Paper', quantity: 5.50, address: 'Kochi, Kerala', center_id: 2, status: 'Approved', created_at: new Date('2026-02-23T11:00:00') }
    ],
    center_notifications: [],
    admin_notifications: []
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

        // 2. Auth: SELECT User (Login / Forgot / Profile)
        if (lowerSql.includes('select * from tbl_users')) {
            const param = params[0];
            let user;

            // Check if query is for user_id
            if (lowerSql.includes('user_id =')) {
                user = mockData.users.find(u => u.user_id == param);
            }
            // Check if query is for email OR name
            else if (lowerSql.includes('or name =')) {
                user = mockData.users.find(u => u.email === param || u.name === param);
            }
            // Default: Email
            else {
                user = mockData.users.find(u => u.email === param);
            }

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

        // 5. Waste: Items SELECT
        if (lowerSql.includes('from tbl_waste_items')) {
            if (lowerSql.includes('where category_id = ? and item_name = ?')) {
                const existing = mockData.waste_items.filter(i => i.category_id == params[0] && i.item_name == params[1]);
                return [existing];
            }
            return [mockData.waste_items];
        }

        // 6. Waste: Items INSERT
        if (lowerSql.includes('insert into tbl_waste_items')) {
            const newItem = {
                item_id: mockData.waste_items.length + 1,
                category_id: params[0],
                item_name: params[1],
                disposal_guideline: params[2],
                safety_instructions: params[3]
            };
            mockData.waste_items.push(newItem);
            return [{ insertId: newItem.item_id }];
        }

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

        // 7c. Centers: DELETE
        if (lowerSql.includes('delete from tbl_collection_centers')) {
            const id = params[0];
            const idx = mockData.collection_centers.findIndex(c => c.center_id == id);
            if (idx !== -1) {
                mockData.collection_centers.splice(idx, 1);
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 7b. Centers: INSERT
        if (lowerSql.includes('insert into tbl_collection_centers')) {
            const newCenter = {
                center_id: mockData.collection_centers.length + 1,
                center_name: params[0],
                address: params[1],
                status: params[2],
                max_slots: params[3],
                available_slots: params[4],
                latitude: params[5],
                longitude: params[6],
                type: 'General' // Default for new centers
            };
            mockData.collection_centers.push(newCenter);
            return [{ insertId: newCenter.center_id }];
        }

        // 7a. Centers: SELECT (All or Filtered) - Moved after specific INSERT/DELETE checks
        if (lowerSql.includes('tbl_collection_centers')) {
            let results = mockData.collection_centers;

            // Enhanced Mock Filter logic
            if (lowerSql.includes('where')) {
                const keyword = params[0] ? params[0].replace('%', '').replace('%', '').toLowerCase() : '';

                results = results.filter(c => {
                    const t = c.type ? c.type.toLowerCase() : '';
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

        // 8. Waste Records: SELECT
        if (lowerSql.includes('from tbl_waste_records')) {
            let results = [...mockData.waste_records];

            // Basic filtering for search/status
            if (lowerSql.includes('where')) {
                // Simplified mock filter logic
                if (params.includes('%')) { /* search */ }
            }
            return [results];
        }

        // 9. Waste Records: INSERT
        if (lowerSql.includes('insert into tbl_waste_records')) {
            const newRecord = {
                record_id: mockData.waste_records.length + 1,
                user_id: params[0],
                waste_type: params[1],
                category: params[2],
                weight: params[3],
                quantity: params[4],
                location: params[5],
                scan_method: params[6],
                pickup_id: params[7],
                status: params[8],
                comments: params[9],
                created_at: new Date()
            };
            mockData.waste_records.push(newRecord);
            return [{ insertId: newRecord.record_id }];
        }

        // 10. Waste Records: UPDATE
        if (lowerSql.includes('update tbl_waste_records')) {
            const id = params[params.length - 1];
            const record = mockData.waste_records.find(r => r.record_id == id);
            if (record) {
                // Update based on common params
                if (params.length >= 4) {
                    record.weight = params[0];
                    record.status = params[3];
                }
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 11. Centers: UPDATE Slots / Status
        if (lowerSql.includes('update tbl_collection_centers')) {
            const centerId = params.find(p => typeof p === 'number' || (typeof p === 'string' && !isNaN(p)));

            // Handle "Reset Primary" - no WHERE or applies to all
            if (lowerSql.includes('is_primary = false')) {
                mockData.collection_centers.forEach(c => c.is_primary = false);
                return [{ affectedRows: mockData.collection_centers.length }];
            }

            const center = mockData.collection_centers.find(c => c.center_id == centerId);

            if (center) {
                if (lowerSql.includes('available_slots = available_slots - 1')) {
                    if (center.available_slots > 0) {
                        center.available_slots--;
                        // Auto-close check (simulating trigger/logic)
                        if (center.available_slots === 0) center.status = 'CLOSED';
                        return [{ affectedRows: 1 }];
                    } else {
                        return [{ affectedRows: 0 }];
                    }
                }

                if (lowerSql.includes('set status =')) {
                    const newStatus = params[0];
                    center.status = newStatus;
                    return [{ affectedRows: 1 }];
                }

                if (lowerSql.includes('is_primary = true')) {
                    center.is_primary = true;
                    return [{ affectedRows: 1 }];
                }
            }
            return [{ affectedRows: 0 }];
        }

        // 12. Marketplace: SELECT
        if (lowerSql.includes('from tbl_marketplace_items')) {
            const results = mockData.marketplace.filter(i => i.status === 'active').map(item => {
                const user = mockData.users.find(u => u.user_id == item.user_id) || { name: 'Demo User' };
                return { ...item, owner_name: user.name };
            });
            return [results];
        }

        // 13. Marketplace: INSERT
        if (lowerSql.includes('insert into tbl_marketplace_items')) {
            const newItem = {
                item_id: mockData.marketplace.length + 1,
                user_id: params[0],
                title: params[1],
                description: params[2],
                category: params[3],
                image_url: params[4],
                status: 'active',
                created_at: new Date()
            };
            mockData.marketplace.unshift(newItem); // unshift to show at top
            return [{ insertId: newItem.item_id }];
        }

        // 14. Special Waste: SELECT
        if (lowerSql.includes('from tbl_special_waste_requests r')) {
            const centerIdPart = lowerSql.match(/where r\.center_id\s*=\s*\?/);
            const centerId = centerIdPart ? params[0] : null;

            let results = mockData.special_waste.map(req => {
                const user = mockData.users.find(u => u.user_id == req.user_id) || { name: 'Demo User', email: 'demo@example.com' };
                const center = mockData.collection_centers.find(c => c.center_id == req.center_id);
                return {
                    ...req,
                    user_name: user.name,
                    email: user.email,
                    center_name: center ? center.center_name : null,
                    assignment_status: req.assignment_status || (req.center_id ? 'assigned' : 'unassigned'),
                    // Map fields for center dashboard if needed
                    waste_type: req.category,
                    quantity: req.quantity_value,
                    unit: req.quantity_unit,
                    assigned_date: req.created_at
                };
            });

            if (centerId) {
                results = results.filter(r => r.center_id == centerId && r.status !== 'Rejected');
            }

            return [results];
        }

        // 14b. Special Waste: INSERT
        if (lowerSql.includes('insert into tbl_special_waste_requests')) {
            const newReq = {
                request_id: mockData.special_waste.length + 101,
                user_id: params[0],
                category: params[1],
                quantity_value: params[2],
                quantity_unit: params[3],
                preferred_date: params[4],
                location: params[5],
                description: params[6],
                image_url: params[7],
                status: 'Pending',
                assignment_status: 'unassigned',
                created_at: new Date()
            };
            mockData.special_waste.push(newReq);
            return [{ insertId: newReq.request_id }];
        }

        // 14c. Special Waste: UPDATE
        if (lowerSql.includes('update tbl_special_waste_requests')) {
            const requestId = params[params.length - 1];
            const request = mockData.special_waste.find(r => r.request_id == requestId);
            if (request) {
                // Status is usually the first param
                request.status = params[0];
                // admin_notes is usually second
                if (params.length > 1) request.admin_notes = params[1];

                // If query has center_id (assignment flow)
                if (lowerSql.includes('center_id = ?')) {
                    // In updateStatus, centerId is the 3rd param (index 2)
                    request.center_id = params[2];
                    request.assignment_status = 'assigned';
                }
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 15. User History: SELECT
        if (lowerSql.includes('from tbl_user_history')) {
            const userId = params[0];
            let results = mockData.user_history.filter(h => h.user_id == userId);

            if (lowerSql.includes('activity_type in')) {
                results = results.filter(h => ['SCAN', 'SEARCH', 'BOT_CHAT'].includes(h.activity_type));
            }
            if (lowerSql.includes("activity_type = 'scan'")) {
                results = results.filter(h => h.activity_type === 'SCAN');
            }

            if (lowerSql.includes('count(*)')) {
                return [[{ total: results.length }]];
            }

            // Always serialize details as string so JSON.parse on frontend works safely
            const serialized = results.map(h => ({
                ...h,
                details: typeof h.details === 'string' ? h.details : JSON.stringify(h.details || {})
            }));
            return [serialized];
        }

        // 16. User History: INSERT
        if (lowerSql.includes('insert into tbl_user_history')) {
            const newHistory = {
                history_id: mockData.user_history.length + 1,
                user_id: params[0],
                activity_type: params[1],
                details: typeof params[2] === 'string' ? params[2] : JSON.stringify(params[2] || {}),
                created_at: new Date()
            };
            mockData.user_history.push(newHistory);
            return [{ insertId: newHistory.history_id }];
        }

        // 17. User History: DELETE (Clear History)
        if (lowerSql.includes('delete from tbl_user_history')) {
            const userId = params[0];
            const before = mockData.user_history.length;
            mockData.user_history = mockData.user_history.filter(h => h.user_id != userId);
            return [{ affectedRows: before - mockData.user_history.length }];
        }

        // 18. Pickup Requests: SELECT
        if (lowerSql.includes('from tbl_pickup_requests')) {
            if (!mockData.pickup_requests) mockData.pickup_requests = [];
            const userId = params[0];
            let results = mockData.pickup_requests.filter(p => p.user_id == userId)
                .map(p => {
                    const center = mockData.collection_centers.find(c => c.center_id == p.center_id);
                    return { ...p, center_name: center ? center.center_name : 'Processing...' };
                });

            if (lowerSql.includes('sum(quantity)')) {
                const total = results
                    .filter(p => !lowerSql.includes("status = 'completed'") || p.status === 'Completed')
                    .reduce((s, p) => s + (parseFloat(p.quantity) || 0), 0);
                return [[{ total_kg: total || null }]];
            }
            if (lowerSql.includes('count(*)')) {
                const count = results.filter(p => p.status === 'Completed').length;
                return [[{ completed_count: count }]];
            }

            return [results];
        }

        // 19. Pickup Requests: INSERT
        if (lowerSql.includes('insert into tbl_pickup_requests')) {
            if (!mockData.pickup_requests) mockData.pickup_requests = [];
            const newReq = {
                request_id: mockData.pickup_requests.length + 1001,
                user_id: params[0],
                center_id: params[1],
                waste_type: params[2],
                quantity: params[3],
                status: params[4] || 'Pending',
                latitude: params[5],
                longitude: params[6],
                address: params[7] || '',
                created_at: new Date()
            };
            mockData.pickup_requests.push(newReq);
            return [{ insertId: newReq.request_id }];
        }

        // 20. Pickup Requests: UPDATE
        if (lowerSql.includes('update tbl_pickup_requests')) {
            if (!mockData.pickup_requests) mockData.pickup_requests = [];
            const id = params[params.length - 1];
            const req = mockData.pickup_requests.find(r => r.request_id == id);
            if (req) {
                if (lowerSql.includes('set status')) {
                    req.status = params[0];
                    if (params[0] === 'Approved') req.accepted_time = new Date();
                    if (params[0] === 'Completed') req.completed_time = new Date();
                }
                if (lowerSql.includes('accepted_time')) req.accepted_time = params[params.indexOf(id) - 1];
                if (lowerSql.includes('completed_time')) req.completed_time = params[params.indexOf(id) - 1];
                return [{ affectedRows: 1 }];
            }
            return [{ affectedRows: 0 }];
        }

        // 21. Pickup Items: INSERT (sub-table)
        if (lowerSql.includes('insert into tbl_pickup_items')) {
            return [{ insertId: Math.floor(Math.random() * 9000) + 1000 }];
        }

        // 22. Notifications: SELECT (user notifications)
        if (lowerSql.includes('from tbl_notifications')) {
            if (!mockData.notifications) mockData.notifications = [];
            const userId = params[0];
            const results = mockData.notifications.filter(n => n.user_id == userId);
            return [results];
        }

        // 23. Notifications: INSERT
        if (lowerSql.includes('insert into tbl_notifications')) {
            if (!mockData.notifications) mockData.notifications = [];
            const newNotif = {
                notification_id: mockData.notifications.length + 1,
                user_id: params[0],
                type: params[1],
                title: params[2],
                message: params[3],
                is_read: false,
                created_at: new Date()
            };
            mockData.notifications.push(newNotif);
            return [{ insertId: newNotif.notification_id }];
        }

        // 24. Notifications: UPDATE (mark read)
        if (lowerSql.includes('update tbl_notifications')) {
            if (!mockData.notifications) mockData.notifications = [];
            const id = params[params.length - 1];
            const notif = mockData.notifications.find(n => n.notification_id == id);
            if (notif) { notif.is_read = true; return [{ affectedRows: 1 }]; }
            return [{ affectedRows: 0 }];
        }

        // 25. Admin/Center Notifications: Mock Handlers
        if (lowerSql.includes('insert into tbl_center_notifications')) {
            const nextId = mockData.center_notifications.length + 1;
            mockData.center_notifications.push({
                id: nextId, center_id: params[0], type: params[1], title: params[2], message: params[3], is_read: false, created_at: new Date()
            });
            return [{ insertId: nextId }];
        }
        if (lowerSql.includes('insert into tbl_admin_notifications')) {
            const nextId = mockData.admin_notifications.length + 1;
            mockData.admin_notifications.push({
                id: nextId, type: params[0], title: params[1], message: params[2], reference_id: params[3], is_read: false, created_at: new Date()
            });
            return [{ insertId: nextId }];
        }
        if (lowerSql.includes('from tbl_center_notifications') || lowerSql.includes('from tbl_admin_notifications')) {
            const table = lowerSql.includes('admin') ? mockData.admin_notifications : mockData.center_notifications;
            return [table];
        }

        // 26. Center Messaging: Mock Handlers
        if (lowerSql.includes('insert into tbl_center_messages')) {
            const nextId = mockData.center_messages.length + 1;
            mockData.center_messages.push({
                message_id: nextId,
                center_id: params[0],
                sender_id: params[1],
                sender_role: params[2],
                sender_name: params[3],
                receiver_id: params[4],
                receiver_role: params[5],
                message_text: params[6],
                delivery_status: params[7],
                is_read: false,
                created_at: new Date(),
                sent_time: new Date()
            });
            return [{ insertId: nextId }];
        }
        if (lowerSql.includes('from tbl_center_messages')) {
            const centerId = params[0];
            const msgs = mockData.center_messages.filter(m => m.center_id == centerId);
            return [msgs];
        }
        if (lowerSql.includes('update tbl_center_messages')) {
            const centerId = params[0];
            const receiverRole = lowerSql.includes('receiver_role = ?') ? params[1] : (lowerSql.includes("receiver_role = 'CENTER'") ? 'CENTER' : 'ADMIN');
            mockData.center_messages.forEach(m => {
                if (m.center_id == centerId && m.receiver_role === receiverRole) {
                    if (lowerSql.includes('is_read = 1')) {
                        m.is_read = true;
                        m.delivery_status = 'read';
                        m.read_time = new Date();
                    } else if (lowerSql.includes('delivery_status = \'delivered\'')) {
                        m.delivery_status = 'delivered';
                        m.delivered_time = new Date();
                    }
                }
            });
            return [{ affectedRows: 1 }];
        }

        // --- User-Center Messaging: Mock Handlers ---
        if (lowerSql.includes('insert into tbl_user_center_messages')) {
            const nextId = mockData.user_center_messages.length + 1;
            mockData.user_center_messages.push({
                message_id: nextId,
                sender_id: params[0],
                sender_role: params[1],
                receiver_id: params[2],
                receiver_role: params[3],
                request_id: params[4],
                message: params[5],
                is_read: false,
                created_at: new Date()
            });
            return [{ insertId: nextId }];
        }
        if (lowerSql.includes('from tbl_user_center_messages')) {
            const requestId = params[0];
            const msgs = mockData.user_center_messages.filter(m => m.request_id == requestId);
            // In live, we populate. In mock, we return simple rows.
            return [msgs];
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

// Wrapper to intercept queries and switch to mock on error
const smartPool = {
    isMock: false, // Initial state
    async query(sql, params) {
        try {
            if (this.isMock) return await new MockPool().query(sql, params);
            return await pool.query(sql, params);
        } catch (error) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ER_NOT_SUPPORTED_AUTH_MODE') {
                if (!this.isMock) {
                    console.warn(`\n⚠️  MYSQL CONNECTION FAILED (${error.code}). SWITCHING TO MOCK DATABASE.\n    App will function normally using in-memory data.\n`);
                    this.isMock = true;
                }
                return await new MockPool().query(sql, params);
            }
            throw error;
        }
    },
    async getConnection() {
        try {
            if (this.isMock) return await new MockPool().getConnection();
            return await pool.getConnection();
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                this.isMock = true;
                console.warn(`\n⚠️  MYSQL CONNECTION FAILED. USING MOCK DB.\n`);
                return await new MockPool().getConnection();
            }
            throw error;
        }
    }
};

// Initial Test & Auto-Migration
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Connected to MySQL Database (Live)');

        // Migration Helper
        const migrate = async (table, colDef) => {
            try {
                await conn.query(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
                console.log(`✅ Column added to ${table}: ${colDef.split(' ')[0]}`);
            } catch (err) {
                if (err.code !== 'ER_DUP_FIELDNAME') console.warn(`Update skipped for ${table}.${colDef.split(' ')[0]}:`, err.message);
            }
        };

        // 1. Users Table Enhancements
        await migrate("tbl_users", "green_score INT DEFAULT 0");
        await migrate("tbl_users", "monthly_points INT DEFAULT 0");
        await migrate("tbl_users", "streak INT DEFAULT 0");
        await migrate("tbl_users", "carbon_saved_kg DECIMAL(10,2) DEFAULT 0");
        await migrate("tbl_users", "leaderboard_rank INT DEFAULT 0");
        await migrate("tbl_users", "center_id INT NULL");
        await migrate("tbl_users", "google_id VARCHAR(255) NULL");
        await migrate("tbl_users", "profile_picture VARCHAR(500) NULL");

        // 2. Center Table Migrations
        await migrate("tbl_collection_centers", "status VARCHAR(10) DEFAULT 'OPEN'");
        await migrate("tbl_collection_centers", "available_slots INT DEFAULT 10");
        await migrate("tbl_collection_centers", "max_slots INT DEFAULT 10");
        await migrate("tbl_collection_centers", "is_primary BOOLEAN DEFAULT FALSE");

        // --- Center Status Automation (Step 8) ---
        await migrate("tbl_collection_centers", "center_status ENUM('online','offline','idle') DEFAULT 'offline'");
        await migrate("tbl_collection_centers", "last_active_time DATETIME NULL");
        await migrate("tbl_collection_centers", "offline_since DATETIME NULL");
        await migrate("tbl_collection_centers", "center_performance_score INT DEFAULT 100");

        // 3. Pickup Requests Migrations
        await migrate("tbl_pickup_requests", "is_urgent BOOLEAN DEFAULT FALSE");

        // --- Pickup Timing (Step 8) ---
        await migrate("tbl_pickup_requests", "assigned_time DATETIME");
        await migrate("tbl_pickup_requests", "accepted_time DATETIME");
        await migrate("tbl_pickup_requests", "completed_time DATETIME");

        // 4. Reports Table Initialization
        try {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS tbl_reports (
                    report_id INT AUTO_INCREMENT PRIMARY KEY,
                    request_id INT,
                    user_id INT NOT NULL,
                    center_id INT,
                    report_type ENUM('SINGLE', 'SUMMARY', 'PERIODIC') DEFAULT 'SINGLE',
                    date_generated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    report_hash VARCHAR(255) UNIQUE,
                    impact_json JSON,
                    filters_json JSON,
                    generated_by INT,
                    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id)
                )
            `);
            console.log("✅ Reports Table verified");
        } catch (err) {
            console.error("❌ Reports Table Migration Error:", err);
        }

        // 5. Special Waste Table Enhancements & Notifications
        await migrate("tbl_special_waste_requests", "center_id INT NULL");
        await migrate("tbl_special_waste_requests", "assignment_status VARCHAR(20) DEFAULT 'unassigned'");
        await migrate("tbl_special_waste_requests", "admin_notes TEXT");

        try {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS tbl_center_notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    center_id INT NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id) ON DELETE CASCADE
                )
            `);
            console.log("✅ Center Notifications Table verified");
        } catch (err) {
            // console.error("❌ Center Notifications Table Migration Error:", err);
        }

        // 6. User History Table
        try {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS tbl_user_history (
                    history_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    activity_type VARCHAR(50) NOT NULL,
                    details JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES tbl_users(user_id) ON DELETE CASCADE
                )
            `);
            console.log("✅ User History Table verified");
        } catch (err) {
            console.error("❌ User History Table Migration Error:", err);
        }

        // 7. Center Messaging & Admin Notifications
        try {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS tbl_center_messages (
                    message_id INT AUTO_INCREMENT PRIMARY KEY,
                    center_id INT NOT NULL,
                    sender_id INT NOT NULL,
                    sender_role VARCHAR(20) NOT NULL,
                    sender_name VARCHAR(255),
                    receiver_id INT NOT NULL,
                    receiver_role VARCHAR(20) NOT NULL,
                    message_text TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_read BOOLEAN DEFAULT FALSE,
                    delivery_status VARCHAR(20) DEFAULT 'sent',
                    sent_time TIMESTAMP NULL,
                    delivered_time TIMESTAMP NULL,
                    read_time TIMESTAMP NULL,
                    FOREIGN KEY (center_id) REFERENCES tbl_collection_centers(center_id) ON DELETE CASCADE
                )
            `);
            await conn.query(`
                CREATE TABLE IF NOT EXISTS tbl_admin_notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    type VARCHAR(50) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    reference_id INT,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("✅ Messaging Tables verified");

            // 8. User-Center Messaging Table
            await conn.query(`
                CREATE TABLE IF NOT EXISTS tbl_user_center_messages (
                    message_id INT AUTO_INCREMENT PRIMARY KEY,
                    sender_id INT NOT NULL,
                    sender_role ENUM('user', 'center') NOT NULL,
                    receiver_id INT NOT NULL,
                    receiver_role ENUM('user', 'center') NOT NULL,
                    request_id INT NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX(request_id),
                    FOREIGN KEY (request_id) REFERENCES tbl_pickup_requests(request_id) ON DELETE CASCADE
                ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            `);
            console.log("✅ User-Center Messaging Table verified");
        } catch (err) {
            console.error("❌ Messaging Migration Error:", err);
        }

        conn.release();
    } catch (e) {
        smartPool.isMock = true;
        console.log(`⚠️  MySQL Unreachable (${e.code}). Mock Database Enabled.`);
    }
})();

export default smartPool;
