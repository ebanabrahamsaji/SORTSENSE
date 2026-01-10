import db from '../db.js';
import { getDistance, convertDistance } from 'geolib';

// Get Nearby Collection Centers
// Optionally filter by category if provided, and sort by distance if lat/lng provided
export const getCollectionCenters = async (req, res) => {
    const { category_id, lat, lng } = req.query;

    try {
        let query = 'SELECT * FROM tbl_collection_centers';
        let params = [];

        if (category_id || req.query.category) {
            query = `
                SELECT cc.* 
                FROM tbl_collection_centers cc
                JOIN tbl_accepted_categories ac ON cc.center_id = ac.center_id
                JOIN tbl_categories cat ON ac.category_id = cat.category_id
                WHERE ${category_id ? 'ac.category_id = ?' : 'cat.category_name LIKE ?'}
            `;
            params = [category_id || `%${req.query.category}%`];
        }

        const [centers] = await db.query(query, params);

        // Calculate Distance if User Location is provided
        if (lat && lng) {
            const userLocation = { latitude: parseFloat(lat), longitude: parseFloat(lng) };

            const centersWithDistance = centers.map(center => {
                const centerLocation = {
                    latitude: parseFloat(center.latitude),
                    longitude: parseFloat(center.longitude)
                };

                // Calculate distance in meters
                const distMeters = getDistance(userLocation, centerLocation);

                // Convert to KM for display
                return {
                    ...center,
                    distance: (distMeters / 1000).toFixed(2), // km string
                    distanceRaw: distMeters // for sorting
                };
            });

            // Sort by nearest first
            centersWithDistance.sort((a, b) => a.distanceRaw - b.distanceRaw);

            // Return top 5
            return res.json(centersWithDistance.slice(0, 5));
        }

        // Return all if no location provided (or specific category filter results)
        res.json(centers);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching collection centers.' });
    }
};
