import db from '../db.js';
import { syncWasteRecord } from './adminController.js';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Identify Waste Item (Forward to Python Flask API)
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

        // 1. Robust Extraction (Handle various AI response formats)
        let rawLabel = aiResult.category || aiResult.class || aiResult.label || aiResult.name || aiResult.prediction || "Uncertain";

        // 2. Normalization Mapping
        const NORMALIZE_MAP = {
            'plastic': 'Plastic',
            'paper': 'Paper',
            'cardboard': 'Paper',
            'glass': 'Glass',
            'metal': 'Metal',
            'organic': 'Organic',
            'food': 'Organic',
            'hazardous': 'Hazardous',
            'ewaste': 'E-Waste',
            'electronics': 'E-Waste'
        };

        let categoryDisplay = "Other/Mixed";
        const lowerRaw = rawLabel.toLowerCase();
        for (const [key, val] of Object.entries(NORMALIZE_MAP)) {
            if (lowerRaw.includes(key)) {
                categoryDisplay = val;
                break;
            }
        }

        const details = getDisposalInfo(categoryDisplay);

        // Sync to Transactional Records and Gamification if userId is present
        if (req.body.userId) {
            syncWasteRecord({
                userId: req.body.userId,
                wasteType: categoryDisplay,
                category: categoryDisplay,
                scanMethod: 'SCAN',
                location: req.body.location || 'Scan Location',
                status: 'Scanned'
            });

            // --- GAMIFICATION ENGINE START ---
            try {
                const POINTS_MAP = {
                    'Plastic': 10, 'Organic': 8, 'Metal': 12, 'Glass': 12,
                    'Mixed': 15, 'Hazardous': 20, 'E-Waste': 20, 'Paper': 10, 'Textile': 10
                };
                const pointsAwarded = POINTS_MAP[categoryDisplay] || 5;

                const [users] = await db.query("SELECT green_score FROM tbl_users WHERE user_id = ?", [req.body.userId]);
                let newScore = 0;
                let currentLevelName = 'Beginner 🌱';
                let motivationalMsg = "Great job recycling! You're helping the planet 🌎";

                if (users.length > 0) {
                    const currentScore = users[0].green_score || 0;
                    newScore = currentScore + pointsAwarded;
                    await db.query("UPDATE tbl_users SET green_score = ?, monthly_points = monthly_points + ? WHERE user_id = ?", [newScore, pointsAwarded, req.body.userId]);

                    const LEVELS = [
                        { name: 'Beginner 🌱', max: 50 },
                        { name: 'Eco Learner 🍃', max: 150 },
                        { name: 'Green Warrior 🌿', max: 300 },
                        { name: 'Recycling Champion ♻️', max: 600 },
                        { name: 'Eco Hero 🌍', max: Infinity }
                    ];
                    currentLevelName = (LEVELS.find(l => newScore <= l.max) || LEVELS[LEVELS.length - 1]).name;

                    const MESSAGES = ["Great job!", "Keep going!", "You're an Eco Hero!", "Sustainable choice!", "Well done!"];
                    motivationalMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
                }

                // Unified History Recording
                const historyPayload = {
                    category: categoryDisplay,
                    confidence: aiResult.confidence || 0,
                    points: pointsAwarded
                };
                recordHistory(req.body.userId, 'SCAN', historyPayload);

                // Final Response with everything
                return res.json({
                    category: categoryDisplay,
                    confidence: aiResult.confidence || 0,
                    status: "Likely Identified",
                    message: `Identified as ${categoryDisplay}`,
                    details: details,
                    is_hazardous: ['Hazardous', 'E-Waste', 'Biomedical'].includes(categoryDisplay),
                    imageUrl: `/${imagePath.replace(/\\/g, '/')}`,
                    points_awarded: pointsAwarded,
                    total_points: newScore,
                    user_level: currentLevelName,
                    motivational_message: motivationalMsg
                });
            } catch (gameErr) {
                console.error("Game Error:", gameErr);
            }
        } else {
            // No userId, just return basic result
            return res.json({
                category: categoryDisplay,
                confidence: aiResult.confidence || 0,
                status: "Likely Identified",
                message: `Identified as ${categoryDisplay}`,
                details: details,
                is_hazardous: ['Hazardous', 'E-Waste', 'Biomedical'].includes(categoryDisplay),
                imageUrl: `/${imagePath.replace(/\\/g, '/')}`
            });
        }
    } catch (error) {
        console.error("AI Service Error:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to process image.' });
        }
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

export const saveWasteImage = async (req, res) => {
    try {
        const { userId, category, imageUrl, location } = req.body;
        if (!userId || !category) {
            return res.status(400).json({ message: 'userId and category are required.' });
        }

        // Record the waste image entry in history
        await recordHistory(userId, 'IMAGE_SAVE', {
            category: category,
            imageUrl: imageUrl || null,
            location: location || 'Unknown'
        });

        // Sync waste record for gamification
        syncWasteRecord({
            userId,
            wasteType: category,
            category,
            scanMethod: 'MANUAL',
            location: location || 'Unknown',
            status: 'Saved'
        });

        res.json({ success: true, message: 'Waste image record saved successfully.' });
    } catch (error) {
        console.error('Save Waste Image Error:', error);
        res.status(500).json({ message: 'Failed to save waste image record.' });
    }
};

export const searchWaste = async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query required' });

    try {
        const NORMALIZE_MAP = {
            'plastic': 'Plastic', 'paper': 'Paper', 'glass': 'Glass', 'metal': 'Metal',
            'organic': 'Organic', 'hazardous': 'Hazardous', 'ewaste': 'E-Waste'
        };

        const lowerQuery = query.toLowerCase();
        let displayCategory = "Uncertain";
        for (const [key, val] of Object.entries(NORMALIZE_MAP)) {
            if (lowerQuery.includes(key)) {
                displayCategory = val;
                break;
            }
        }

        const details = getDisposalInfo(displayCategory);

        res.json({
            category: displayCategory,
            disposal_method: details.disposal_guideline,
            kerala_rule: details.kerala_mandate,
            rules: details.kerala_mandate
        });

        if (req.body.userId) {
            recordHistory(req.body.userId, 'SEARCH', { query: query, result: displayCategory });
        }
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: 'Search failed' });
    }
};
