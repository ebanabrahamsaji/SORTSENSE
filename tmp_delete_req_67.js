import db from './db.js';
try {
    const requestId = 67;
    console.log(`Deleting items for request ${requestId}...`);
    await db.query("DELETE FROM tbl_pickup_items WHERE request_id = ?", [requestId]);
    console.log(`Deleting request ${requestId}...`);
    const [result] = await db.query("DELETE FROM tbl_pickup_requests WHERE request_id = ?", [requestId]);
    console.log("Result:", result);
} catch (e) {
    console.error("Error:", e);
}
process.exit(0);
