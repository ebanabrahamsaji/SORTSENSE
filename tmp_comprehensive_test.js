import { createPickupRequest } from './controllers/pickupController.js';
import db from './db.js';

async function runTest(address, label) {
    console.log(`\n--- TEST SCENARIO: ${label} ---`);
    console.log(`Input Address: "${address}"`);

    const req = {
        body: {
            userId: 2, // Admin user ID usually exists
            wasteType: 'Plastic',
            quantity: 10,
            address: address,
            lat: 9.9312, // Kochi Coords (should be ignored if string matches)
            lng: 76.2673
        }
    };

    const res = {
        code: 200,
        data: {},
        status: function (s) { this.code = s; return this; },
        json: function (d) { this.data = d; }
    };

    try {
        await createPickupRequest(req, res);
        console.log(`Status: ${res.code}`);
        if (res.code === 201) {
            console.log(`PASS: ${res.data.assignedCenter}`);
            // Cleanup: delete the test request
            if (res.data.requestId) {
                await db.query("DELETE FROM tbl_pickup_items WHERE request_id = ?", [res.data.requestId]);
                await db.query("DELETE FROM tbl_pickup_requests WHERE request_id = ?", [res.data.requestId]);
                console.log(`(Cleanup: Deleted test request #${res.data.requestId})`);
            }
        } else {
            console.log(`❌ Failed: ${res.data.message}`);
        }
    } catch (e) {
        console.error(`Error in ${label}:`, e.message);
    }
}

async function startTests() {
    // 1. Exact Match Kanjirapally
    await runTest('kanjirapally || SLOT:Anytime', 'Kanjirapally Strict Match');

    // 2. Exact Match Kochi
    await runTest('kochi || SLOT:Morning', 'Kochi Strict Match');

    // 3. Distance Match (Random location)
    await runTest('A random street in Kottayam || SLOT:Evening', 'Distance Fallback');

    process.exit(0);
}

startTests();
