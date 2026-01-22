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

        // Record History
        if (req.body.userId) {
            // Import function logic locally to avoid circular dependency issues if any, 
            // but since it's same file, direct call is fine. 
            // Note: identifyWaste is above recordHistory, but hoisting/module scope handles it.
            // However, to be safe, I'll invoke the DB directly or move the function up. 
            // Actually, simplest is to just INSERT here since I edit this file.
            const uid = req.body.userId;
            db.query(
                "INSERT INTO tbl_user_history (user_id, activity_type, details) VALUES (?, 'SCAN', ?)",
                [uid, JSON.stringify({ category: categoryDisplay, confidence: aiResult.confidence })]
            ).catch(e => console.error("Scan History Error:", e));
        }

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


// --- Text Search Controller ---
const KEYWORD_MAP = {
    plastic: ['plastic', 'bottle', 'container', 'cover', 'bag', 'wrapper', 'packet', 'milk', 'straw', 'cup', 'toy', 'bucket', 'pvc', 'tupperware', 'poly'],
    organic: ['food', 'vegetable', 'fruit', 'peel', 'leaf', 'flower', 'meat', 'bone', 'garden', 'tea', 'coffee', 'egg', 'leftover', 'banana', 'orange', 'apple', 'fish', 'chicken', 'rice', 'bread'],
    paper: ['paper', 'newspaper', 'book', 'magazine', 'cardboard', 'carton', 'box', 'envelope', 'ticket', 'receipt', 'card', 'tissue'],
    glass: ['glass', 'bottle', 'jar', 'mirror', 'window', 'pane', 'crystal', 'bulb'],
    metal: ['metal', 'can', 'tin', 'aluminum', 'foil', 'steel', 'iron', 'copper', 'screw', 'nail', 'utensil', 'pot', 'pan', 'knife', 'fork', 'spoon', 'wire'],
    ewaste: ['computer', 'laptop', 'keyboard', 'mouse', 'monitor', 'screen', 'phone', 'mobile', 'charger', 'cable', 'printer', 'television', 'tv', 'remote', 'battery', 'cell', 'electronic', 'circuit', 'gadget'],
    hazardous: ['mechanical', 'chemical', 'pesticide', 'insecticide', 'paint', 'varnish', 'solvent', 'cleaner', 'poison', 'acid', 'oil', 'thermometer', 'syringe', 'medical', 'medicine', 'tablet', 'pill', 'bulb', 'cfl', 'tube', 'light'],
    textile: ['cloth', 'fabric', 'textile', 'cotton', 'shirt', 'brand', 'dress', 'jeans', 'towel', 'bedsheet', 'rag', 'garment']
};

export const searchWaste = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        const lowerQuery = query.toLowerCase().trim();
        let detectedCategory = 'Uncertain';
        let maxConfidence = 0;

        // Keyword Matching
        for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
            // Check exact word match or substring if length > 4 to avoid false positives
            if (keywords.some(k => lowerQuery.includes(k))) {
                detectedCategory = cat;
                maxConfidence = 95;
                break;
            }
        }

        // Map to Display Names
        const categoryMap = {
            'ewaste': 'E-waste',
            'hazardous': 'Hazardous'
        };
        const displayCategory = categoryMap[detectedCategory] || detectedCategory.charAt(0).toUpperCase() + detectedCategory.slice(1);

        const details = getDisposalInfo(detectedCategory);

        res.json({
            category: displayCategory,
            confidence: maxConfidence,
            message: `Identified as ${displayCategory}`,
            details: details, // Frontend expects: disposal_guideline, kerala_mandate
            is_hazardous: detectedCategory === 'hazardous',
            // Add extra fields for the UI to be rich
            disposal_method: details.disposal_guideline,
            kerala_rule: details.kerala_mandate,
            rules: details.kerala_mandate
        });

        // Record History (Async)
        if (req.body.userId) {
            recordHistory(req.body.userId, 'SEARCH', { query: query, result: displayCategory });
        }

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: 'Search failed' });
    }
};

export const recordHistory = async (userId, type, details) => {
    try {
        if (!userId) return;
        await db.query(
            "INSERT INTO tbl_user_history (user_id, activity_type, details) VALUES (?, ?, ?)",
            [userId, type, JSON.stringify(details)]
        );
    } catch (err) {
        console.error("History Record Error:", err);
    }
};

function getDisposalInfo(category) {
    const cat = category.toLowerCase();

    // Richer Responses with HTML formatting for the frontend to render directly
    if (cat.includes('plastic')) return {
        disposal_guideline: "<strong>1. Clean & Dry:</strong> Wash the plastic item and dry it.<br><strong>2. Store:</strong> Keep it in a separate dry bag.<br><strong>3. Handover:</strong> Give to <strong>Haritha Karma Sena</strong> during their monthly collection drives.",
        kerala_mandate: "Burning plastic is a punishable offense in Kerala. Single-use plastics are banned. Always segregate clean plastics for recycling.",
        safety_instructions: "Ensure no food residue is left to prevent smell and pests."
    };

    if (cat.includes('organic')) return {
        disposal_guideline: "<strong>1. Segregate:</strong> Keep wet waste separate from plastic/paper.<br><strong>2. Compost:</strong> Use a bio-bin, ring compost, or biogas plant at source.<br><strong>3. Community:</strong> If you lack space, use community aerobic bins.",
        kerala_mandate: "Source segregation is mandatory. Wet waste should be treated at source (household level) wherever possible.",
        safety_instructions: "Keep bin covered to avoid flies."
    };

    if (cat.includes('glass')) return {
        disposal_guideline: "<strong>1. Rinse:</strong> Clean the bottle/jar.<br><strong>2. Wrap:</strong> If broken, wrap securely in newspaper.<br><strong>3. Sell/Handover:</strong> Give to scratch dealers or special collection drives.",
        kerala_mandate: "Do not mix glass (especially broken) with food waste or plastic. It endangers sanitation workers.",
        safety_instructions: "Handle broken glass with extreme care."
    };

    if (cat.includes('metal')) return {
        disposal_guideline: "<strong>1. Clean:</strong> Remove non-metal parts if easy.<br><strong>2. Store:</strong> Keep dry.<br><strong>3. Sell:</strong> Metal is high-value; sell to local scrap dealers.",
        kerala_mandate: "Recoverable metal should be recycled, not dumped.",
        safety_instructions: "Watch out for sharp rusted edges."
    };

    if (cat.includes('ewaste') || cat.includes('e-waste')) return {
        disposal_guideline: "<strong>1. Keep Intact:</strong> Do not break screens or dismantle.<br><strong>2. Store:</strong> Keep separate in dry area.<br><strong>3. Deposit:</strong> Drop off at authorized e-waste collection centers or special drives.",
        kerala_mandate: "E-waste Rules 2022: Unorganized disposal is prohibited. Use authorized recyclers only.",
        safety_instructions: "Do not puncture batteries."
    };

    if (cat.includes('hazardous')) return {
        disposal_guideline: "<strong>1. Segregate:</strong> Do not mix with general waste.<br><strong>2. Secure:</strong> Keep in sealed containers.<br><strong>3. Handover:</strong> Give to biomedical/hazardous waste collectors (e.g., IMAGE for medical).",
        kerala_mandate: "Hazardous waste must not go to landfills or water bodies.",
        safety_instructions: "Wear gloves; do not touch with bare hands."
    };

    if (cat.includes('paper')) return {
        disposal_guideline: "<strong>1. Clean:</strong> Ensure paper is not soiled with food.<br><strong>2. Bundle:</strong> Stack newspapers and cartons.<br><strong>3. Sell:</strong> Monthly sale to scrap dealers.",
        kerala_mandate: "Do not burn paper; recycling saves trees.",
        safety_instructions: "Keep away from fire sources."
    };

    if (cat.includes('textile')) return {
        disposal_guideline: "<strong>1. Wash & Dry:</strong> Clean the clothes.<br><strong>2. Don't Dump:</strong> Donate usable items.<br><strong>3. Recycle:</strong> Rags can be given to textile recycling units.",
        kerala_mandate: "Burning textile waste is polluting and discouraged.",
        safety_instructions: "Ensure items are hygienic before handover."
    };

    return {
        disposal_guideline: "Segregate based on material. If unsure, check locally.",
        kerala_mandate: "Strict source segregation is the law in Kerala.",
        safety_instructions: "Dispose responsibly."
    };
}
