import db from '../db.js';


// Get Waste Categories
export const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM tbl_categories');
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch categories.' });
    }
};

// Identify Waste Item (Simulated AI or retrieval)
// In a real scenario, this might accept an image, process it, and return the item details.
// Here we fetch based on item name matching.
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Identify Waste Item (AI Integration)
// Identify Waste Item (AI Integration)
// Identify Waste Item (Forward to Python Flask API)
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export const identifyWaste = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Image file is required.' });
    }

    try {
        const imagePath = req.file.path;

        // Prepare form data for Python API
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));

        // Call Python Flask API (Internal)
        const pythonApiUrl = 'http://127.0.0.1:5000/analyze';

        console.log(`Forwarding to AI Service: ${pythonApiUrl}`);

        const response = await axios.post(pythonApiUrl, formData, {
            headers: { ...formData.getHeaders() }
        });

        const aiResult = response.data;
        // Expected from Python: { category: "plastic", confidence: 95.5, disposal_guidance: "..." }

        const category = aiResult.category;
        const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);

        // Prepare details object using Python's guidance + Backend DB fallback
        let details = {
            disposal_guideline: aiResult.disposal_guidance,
            kerala_mandate: aiResult.disposal_guidance, // Use same text for specific rule
            safety_instructions: "Handle with care."
        };

        // Optional: Enrich with DB data if needed, but Python data is primary now as per request
        // We can create a response that fits the frontend expected structure

        res.json({
            category: categoryDisplay,
            confidence: aiResult.confidence,
            message: `Identified as ${categoryDisplay}`,
            details: details,
            is_hazardous: category === 'hazardous'
        });

    } catch (error) {
        console.error("AI Service Error:", error.message);
        res.status(500).json({ message: 'Failed to process image.' });
    }
};

// Helper: Smart Fallback Rules (Ported from temp backend)
function getFallbackRules(item) {
    if (!item) return {
        disposal_guideline: "General waste – follow local segregation rules.",
        safety_instructions: "Handle with care."
    };

    const lowerItem = item.toLowerCase();

    if (lowerItem.includes("battery")) {
        return {
            disposal_guideline: "Hazardous waste – take to authorized collection center.",
            safety_instructions: "Wear gloves & mask. Do not pierce or crush."
        };
    }

    if (lowerItem.includes("bottle") || lowerItem.includes("plastic")) {
        return {
            disposal_guideline: "Plastic waste – clean and give to plastic collection unit.",
            safety_instructions: "Ensure container is empty and rinsed."
        };
    }

    if (lowerItem.includes("glass")) {
        return {
            disposal_guideline: "Glass waste – Rinse and hand over separately.",
            safety_instructions: "Wrap broken glass in paper to prevent injury."
        };
    }

    return {
        description: "No specific details found in database.",
        disposal_guideline: "General waste – follow local segregation rules.",
        safety_instructions: "Dispose of responsibly."
    };
}

// Upload Waste Image (Record in DB)
export const saveWasteImage = async (req, res) => {
    const { user_id, item_id, image_url } = req.body;

    try {
        await db.query(
            'INSERT INTO tbl_item_images (uploaded_by, item_id, image_url) VALUES (?, ?, ?)',
            [user_id, item_id, image_url]
        );
        res.status(201).json({ message: 'Image recorded successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving image record.' });
    }
};
