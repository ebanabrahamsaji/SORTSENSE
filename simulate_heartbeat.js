// Native fetch used

async function simulateHeartbeat() {
    const centerId = 696; // hkskanjirapally
    console.log(`Sending heartbeat for center ${centerId}...`);
    try {
        const res = await fetch('http://localhost:8000/api/centers/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ centerId })
        });
        const data = await res.json();
        console.log('Response:', data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

simulateHeartbeat();
