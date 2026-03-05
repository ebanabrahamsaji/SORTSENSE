import { createPickupRequest } from './controllers/pickupController.js';
import db from './db.js';

async function t(addr) {
    const res = { status: function (s) { this.code = s; return this; }, json: function (d) { this.data = d; } };
    await createPickupRequest({ body: { userId: 2, wasteType: 'Plastic', quantity: 1, address: addr, lat: 9.9, lng: 76.2 } }, res);
    console.log(`ADDR: ${addr.split('||')[0].trim()} -> CENTER: ${res.data.assignedCenter}`);
    if (res.data.requestId) {
        await db.query("DELETE FROM tbl_pickup_items WHERE request_id = ?", [res.data.requestId]);
        await db.query("DELETE FROM tbl_pickup_requests WHERE request_id = ?", [res.data.requestId]);
    }
}

async function start() {
    await t('kanjirapally || SLOT:A');
    await t('kochi || SLOT:B');
    await t('random || SLOT:C');
    process.exit(0);
}
start();
