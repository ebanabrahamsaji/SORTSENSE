
import db from '../db.js';

// Configuration for Aggregation
const THRESHOLDS = {
    'Organic': 3.0,
    'Plastic': 5.0,
    'Glass': 10.0,
    'E-waste': 15.0,
    'Metal': 10.0,
    'Hazardous': 2.0, // Low threshold due to risk
    'General': 10.0
};

const MAX_WAIT_HOURS = {
    'Organic': 24,
    'Plastic': 72,
    'Glass': 168, // 7 days
    'E-waste': 168,
    'Hazardous': 24,
    'Metal': 168,
    'General': 72
};

// Helper: Calculate Priority Score
const calculatePriority = (request, item, userScore) => {
    let score = 0;

    // 1. Waste Type Urgency
    if (['Organic', 'Hazardous'].includes(item.waste_type)) score += 50;
    else if (['Plastic'].includes(item.waste_type)) score += 20;

    // 2. Quantity (1 point per kg)
    score += Math.floor(item.quantity * 10);

    // 3. Wait Time (5 points per hour)
    const hoursWaited = (new Date() - new Date(request.created_at)) / (1000 * 60 * 60);
    score += Math.floor(hoursWaited * 5);

    // 4. User Reliability (Green Score / 100)
    if (userScore) score += Math.floor(userScore / 100);

    return score;
};

// MAIN AGGREGATION LOGIC
export const checkAggregation = async (centerId) => {
    console.log(`🔄 Checking Aggregation for Center ID: ${centerId}`);

    try {
        // 1. Fetch All "Waiting" Requests for this Center
        const query = `
            SELECT r.request_id, r.created_at, r.user_id, u.green_score, i.item_id, i.waste_type, i.quantity
            FROM tbl_pickup_requests r
            JOIN tbl_pickup_items i ON r.request_id = i.request_id
            LEFT JOIN tbl_users u ON r.user_id = u.user_id
            WHERE r.center_id = ? AND r.status = 'Aggregation_Pending'
        `;

        const [rows] = await db.query(query, [centerId]);

        if (rows.length === 0) {
            console.log("   -> No pending requests.");
            return;
        }

        // 2. Bucketing by Waste Type
        const buckets = {}; // { 'Plastic': { totalWeight: 0, requests: [], oldestTime: Date } }

        rows.forEach(row => {
            const type = row.waste_type || 'General';
            if (!buckets[type]) {
                buckets[type] = {
                    totalWeight: 0,
                    requests: new Set(), // Set of Request IDs
                    oldestRequest: new Date(),
                    items: []
                };
            }

            buckets[type].totalWeight += parseFloat(row.quantity);
            buckets[type].requests.add(row.request_id);
            buckets[type].items.push(row);

            const reqTime = new Date(row.created_at);
            if (reqTime < buckets[type].oldestRequest) {
                buckets[type].oldestRequest = reqTime;
            }
        });

        // 3. internal Check - Trigger Dispatch?
        const requestsToSchedule = new Set();
        const reasons = [];

        for (const [type, data] of Object.entries(buckets)) {
            const threshold = THRESHOLDS[type] || 10.0;
            const maxWait = MAX_WAIT_HOURS[type] || 72;

            const hoursWaited = (new Date() - data.oldestRequest) / (1000 * 60 * 60);

            let trigger = false;
            let reason = "";

            if (data.totalWeight >= threshold) {
                trigger = true;
                reason = `Threshold Met (${data.totalWeight.toFixed(1)}/${threshold}kg)`;
            } else if (hoursWaited >= maxWait) {
                trigger = true;
                reason = `Max Wait Time Exceeded (${hoursWaited.toFixed(1)}h)`;
            }

            if (trigger) {
                console.log(`   ✅ TRIGGERED: ${type} - ${reason}`);
                data.requests.forEach(id => requestsToSchedule.add(id));
                reasons.push(`${type}: ${reason}`);
            } else {
                console.log(`   ⏳ WAITING: ${type} - ${data.totalWeight}/${threshold}kg, ${hoursWaited.toFixed(1)}/${maxWait}h`);
            }
        }

        // 4. Update Status for Triggered Requests
        if (requestsToSchedule.size > 0) {
            const ids = Array.from(requestsToSchedule);
            const notes = `Auto-Scheduled: ${reasons.join('; ')}`;
            // A random future time (e.g., tomorrow 9 AM)
            // Ideally this would be real logic, but for now +24h
            const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

            // MySQL expects 'YYYY-MM-DD HH:MM:SS'
            const scheduledTimeSQL = scheduledTime.toISOString().slice(0, 19).replace('T', ' ');

            // Calculate Priority for each Request and Update
            for (const row of rows) {
                if (requestsToSchedule.has(row.request_id)) {
                    const pScore = calculatePriority(row, row, row.green_score || 0);
                    // Fire and forget update
                    db.query("UPDATE tbl_pickup_requests SET priority_score = ? WHERE request_id = ?", [pScore, row.request_id]);
                }
            }

            // Update Query
            const updateQuery = `
                UPDATE tbl_pickup_requests 
                SET 
                    status = 'Ready_For_Dispatch', 
                    scheduled_at = ?,
                    notes = CONCAT(IFNULL(notes, ''), ?)
                WHERE request_id IN (?)
            `;

            await db.query(updateQuery, [scheduledTimeSQL, ` | ${notes}`, ids]);

            console.log(`   🚀 Updated ${ids.length} requests to Ready_For_Dispatch.`);
        }

    } catch (error) {
        console.error("❌ Aggregation Error:", error);
    }
};
