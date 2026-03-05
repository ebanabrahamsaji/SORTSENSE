import db from './db.js';
try {
    console.log("Deleting items for request 65...");
    await db.query("DELETE FROM tbl_pickup_items WHERE request_id = 65");
    console.log("Deleting request 65...");
    const [result] = await db.query("DELETE FROM tbl_pickup_requests WHERE request_id = 65");
    console.log("Result:", result);
} catch (e) {
    console.error("Error:", e);
}
process.exit(0);
