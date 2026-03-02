import { sendUserCenterMessage } from './controllers/messageController.js';
import db from './db.js';

(async () => {
    try {
        const [pickups] = await db.query("SELECT * FROM tbl_pickup_requests LIMIT 1");
        if (pickups.length === 0) { console.log("No pickups exist"); process.exit(0); }
        const p = pickups[0];

        const req = {
            user: { role: 'USER', id: p.user_id, user_id: p.user_id },
            body: { requestId: p.request_id, message: "Hello world testing 123" }
        };
        const res = {
            status: function (code) { console.log("Status:", code); return this; },
            json: function (data) { console.log("JSON:", data); }
        };

        await sendUserCenterMessage(req, res);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
