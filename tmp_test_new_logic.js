import 'dotenv/config';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

async function run() {
    // Generate token for center 690
    const centerToken = jwt.sign(
        { id: 690, role: 'CENTER', email: 'ekm@sortsense.com', name: 'EKM Center' },
        process.env.JWT_SECRET || 'supersecret_sortsense_key_var',
        { expiresIn: '24h' }
    );

    console.log("Testing POST /api/messages/user-center/send as center 690 to request 64");
    const res = await fetch('http://localhost:8000/api/messages/user-center/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${centerToken}` },
        body: JSON.stringify({ requestId: 64, message: "Hello user, coming to pick it up!" })
    });

    console.log(res.status, await res.text());
}
run();
