import { createPickupRequest } from './controllers/pickupController.js';

// Mock req/res
const req = {
    body: {
        userId: 2,
        wasteType: 'Plastic',
        quantity: 10,
        address: 'kanjirapally || SLOT:Anytime',
        lat: 0,
        lng: 0
    }
};

const res = {
    status: function (code) {
        console.log('Status Code:', code);
        return this;
    },
    json: function (data) {
        console.log('Response:', JSON.stringify(data, null, 2));
    }
};

// We need to provide db as well since it's used in the controller
// But createPickupRequest is an exported function, it will use the db import inside the file
// So we just need to run it in a node environment that supports imports

try {
    await createPickupRequest(req, res);
} catch (e) {
    console.error('Test failed:', e);
}
process.exit(0);
