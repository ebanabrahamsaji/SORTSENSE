import db from '../db.js';

// Get Nearby Collection Centers
// Uses Haversine formula in SQL for accurate distance calculation
export const getCollectionCenters = async (req, res) => {
    const { category, lat, lng } = req.query;

    try {
        let query = "";
        let params = [];
        let whereClauses = [];

        // Base Query Selection
        let selectClause = "SELECT cc.*";

        // Haversine Distance Calculation (if lat/lng provided)
        if (lat && lng) {
            selectClause += `, (6371 * acos(
                cos(radians(?)) * cos(radians(cc.latitude)) * 
                cos(radians(cc.longitude) - radians(?)) + 
                sin(radians(?)) * sin(radians(cc.latitude))
            )) AS distance`;
            params.push(lat, lng, lat);
        } else {
            selectClause += ", NULL as distance";
        }

        query = `${selectClause} FROM tbl_collection_centers cc`;

        // Category Filtering
        // We join with the accepted categories table if a category is specified
        if (category && category !== 'all' && category !== 'undefined') {
            query = `${selectClause} FROM tbl_collection_centers cc`; // Reset base without WHERE yet

            // LEFT JOIN to allow filtering by category but also keeping center info for check
            query += ` 
            LEFT JOIN tbl_accepted_categories ac ON cc.center_id = ac.center_id
            LEFT JOIN tbl_categories cat ON ac.category_id = cat.category_id`;

            // Flexible matching: Category matches OR Type matches Keyword OR Type is HKS
            whereClauses.push("(cat.category_name LIKE ? OR cc.type LIKE ? OR cc.type LIKE '%HKS%' OR cc.type LIKE '%Harita%')");
            params.push(`%${category}%`, `%${category}%`);
        }

        // Apply Where Clauses
        if (whereClauses.length > 0) {
            query += " WHERE " + whereClauses.join(" AND ");
        }

        // Add DISTINCT to main select to avoid duplicates from joins
        query = query.replace('SELECT cc.*', 'SELECT DISTINCT cc.*');

        // Sorting
        // If sorting by distance, order by distance ASC
        if (lat && lng) {
            query += " ORDER BY distance ASC";
        } else {
            query += " ORDER BY cc.center_name ASC";
        }

        // Limit Results (optional, but good for performance)
        query += " LIMIT 50";

        // console.log(`[CenterController] Query params: ${params}`);

        const [centers] = await db.query(query, params);

        // Format for Frontend
        const formattedCenters = centers.map(c => ({
            ...c,
            distance: c.distance !== null ? parseFloat(c.distance).toFixed(2) : null,
            // Ensure numeric for map plotting
            latitude: parseFloat(c.latitude),
            longitude: parseFloat(c.longitude)
        }));

        res.json(formattedCenters);

    } catch (error) {
        console.error("Error fetching centers:", error);
        res.status(500).json({ message: 'Error fetching collection centers.' });
    }
};

// Get Center Profile by ID
export const getCenterById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM tbl_collection_centers WHERE center_id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Center not found" });

        const center = rows[0];
        // Normalize to match user profile structure for easier frontend consumption
        res.json({
            user: {
                name: center.center_name,
                email: center.contact_email || 'No Email',
                role: 'CENTER',
                center_id: center.center_id,
                phone: center.contact_phone,
                address: center.address,
                // Add specific center fields if needed
            }
        });
    } catch (error) {
        console.error("Get Center Error:", error);
        res.status(500).json({ message: "Error fetching center profile" });
    }
};
