import axios from 'axios';

async function testPickup() {
    try {
        const res = await axios.post('http://localhost:8000/api/pickup/request', {
            userId: 1, // Assumption: User 1 exists. If not, we'll get FK error.
            wasteType: "Plastic",
            quantity: 5,
            lat: 9.55,
            lng: 76.80
        });
        console.log("Success:", res.data);
    } catch (err) {
        if (err.response) {
            console.error("API Error:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Network Error:", err.message);
        }
    }
}

testPickup();
