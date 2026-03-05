import db from './db.js';
const [requests] = await db.query("SELECT * FROM tbl_pickup_requests WHERE user_id = 3 ORDER BY created_at DESC LIMIT 5");
console.log("Requests:", JSON.stringify(requests, null, 2));

for (const req of requests) {
    const [items] = await db.query("SELECT * FROM tbl_pickup_items WHERE request_id = ?", [req.request_id]);
    console.log(`Items for Request ${req.request_id}:`, JSON.stringify(items, null, 2));
}
process.exit(0);
