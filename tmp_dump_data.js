import db from './db.js';
const [users] = await db.query("SELECT user_id, name, email FROM tbl_users");
console.log(JSON.stringify(users, null, 2));

const [allReqs] = await db.query("SELECT * FROM tbl_pickup_requests");
console.log("All Requests:", JSON.stringify(allReqs, null, 2));

const [allItems] = await db.query("SELECT * FROM tbl_pickup_items");
console.log("All Items:", JSON.stringify(allItems, null, 2));

process.exit(0);
