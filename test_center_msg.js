import fs from 'fs';
import { sendUserCenterMessage } from './controllers/userCenterMessageController.js';

let logs = [];
function log(msg) { logs.push(msg); }

async function runTest() {
    const req = {
        body: { requestId: 61, message: "test msg" },
        user: { role: 'CENTER', id: 690 }
    };

    const res = {
        status: (code) => {
            log("TEST 1 Status: " + code);
            return { json: (data) => log("TEST 1 JSON: " + JSON.stringify(data)) };
        },
        json: (data) => log("TEST 1 JSON2: " + JSON.stringify(data))
    };

    await sendUserCenterMessage(req, res);
    fs.writeFileSync('test_out.json', JSON.stringify(logs, null, 2));
    process.exit();
}
runTest();
