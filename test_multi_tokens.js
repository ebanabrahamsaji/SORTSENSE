import { sendUserCenterMessage } from './controllers/userCenterMessageController.js';
import db from './db.js';

(async () => {
    try {
        const [pickups] = await db.query("SELECT * FROM tbl_pickup_requests LIMIT 1");
        if (pickups.length === 0) { console.log("No pickups exist"); process.exit(0); }
        const p = pickups[0];

        // Simulating the user object decoded from a token created by `addCenterUser`
        const req = {
            user: { role: 'CENTER', id: 50, user_id: 50, center_id: p.center_id, name: "Admin who manages center" },
            body: { requestId: p.request_id, message: "Hello world testing 123 from center user" }
        };
        const res = {
            status: function (code) { console.log("Status:", code); return this; },
            json: function (data) { console.log("JSON:", data); }
        };

        console.log("Testing with Center User token (id=user_id, center_id=center_id):")
        await sendUserCenterMessage(req, res);

        // Simulating the user object decoded from a token created by `centerLogin`
        const req2 = {
            user: { role: 'CENTER', id: p.center_id, email: "center@example.com" },
            body: { requestId: p.request_id, message: "Hello testing from raw center" }
        };
        const res2 = {
            status: function (code) { console.log("Status2:", code); return this; },
            json: function (data) { console.log("JSON2:", data); }
        };

        console.log("\nTesting with Raw Center token (id=center_id):")
        await sendUserCenterMessage(req2, res2);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
