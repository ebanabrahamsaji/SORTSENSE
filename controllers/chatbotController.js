import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI (only works if key is present)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// EcoBot System Prompt
// EcoBot System Prompt
const ECOBOT_SYSTEM_PROMPT = `
You are EcoBot, the Waste Management Assistant of the SortSense system.

Your goal is to give users clear, practical, and helpful guidance on:
- How to recycle different waste items
- How to compost organic waste at home
- Whether an item is recyclable or biodegradable
- Safe disposal methods for hazardous waste
- Eco-friendly waste reduction tips

Response Rules:
1. Always give step-by-step practical guidance when possible.
2. If the user mentions recyclable waste (plastic, glass, metal, paper):
   Explain HOW to recycle it properly.
3. If the user mentions organic waste (food, vegetable peels, etc.):
   Explain HOW to compost it at home in simple steps.
4. Keep answers short, simple, and useful (3–5 steps max).
5. Encourage eco-friendly behavior naturally.
6. Use friendly tone and simple language.
7. Avoid long theory — focus on practical steps.

Example Format:
"Plastic Bottle:
1. Rinse the bottle.
2. Remove cap.
3. Dry and bin it."
`;

// Fallback Rule-Based System (Enhanced to match EcoBot Persona)
function getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();

    // Greetings
    if (lowerMsg.match(/\b(hi|hello|hey|greetings)\b/)) {
        return "Hello! I'm EcoBot. Ask me how to recycle specific items or how to compost! 🌿";
    }

    // Specific Items (matching user examples)
    if (lowerMsg.includes('plastic bottle') || lowerMsg.includes('bottle')) {
        return "To recycle a Plastic Bottle:\n1. Rinse the bottle to remove residue.\n2. Remove cap and label if required.\n3. Dry the bottle.\n4. Put it in plastic recycling bin.";
    }

    if (lowerMsg.includes('glass')) {
        return "For Glass Items:\n1. Clean and dry the glass item.\n2. Do not mix with ceramic or mirror glass.\n3. Place in glass recycling bin. Handle with care! 🍷";
    }

    if (lowerMsg.includes('metal') || lowerMsg.includes('can')) {
        return "For Metal Cans:\n1. Rinse the can thoroughly.\n2. Crush lightly to save space (optional).\n3. Put in metal recycling bin. 🥫";
    }

    if (lowerMsg.includes('paper') || lowerMsg.includes('newspaper')) {
        return "For Paper Recycling:\n1. Keep paper dry and clean.\n2. Do not recycle oily/wet paper (like pizza boxes).\n3. Place in paper recycling bin. 📰";
    }

    if (lowerMsg.includes('compost') || lowerMsg.includes('organic') || lowerMsg.includes('food') || lowerMsg.includes('peel') || lowerMsg.includes('waste')) {
        if (lowerMsg.includes('plastic') || lowerMsg.includes('metal') || lowerMsg.includes('glass') || lowerMsg.includes('hazardous')) {
            // Fallthrough if mixed with other keywords, but if primarily organic:
        } else {
            return "How to Compost at Home:\n1. Collect vegetable peels, fruit waste, leaves, and food scraps.\n2. Put them in a compost bin or container with air holes.\n3. Add dry leaves or soil to balance moisture.\n4. Mix occasionally. It will turn into fertilizer! 🌱";
        }
    }

    if (lowerMsg.includes('banana') || lowerMsg.includes('fruit') || lowerMsg.includes('vegetable')) {
        return "Yes, that is biodegradable! \n1. Chop larger pieces for faster decomposition.\n2. Add to your compost bin.\n3. Cover with dry leaves/soil.";
    }

    if (lowerMsg.includes('battery') || lowerMsg.includes('batteries')) {
        return "⚠️ Hazardous Waste Warning:\nNever throw batteries in the normal bin.\n1. Tape the terminals if possible.\n2. Store properly.\n3. Drop off at an authorized e-waste collection center.";
    }

    if (lowerMsg.includes('reduce')) {
        return "To Reduce Waste:\n1. Use reusable bags and bottles.\n2. Avoid single-use plastics.\n3. Compost your organic kitchen waste.\n4. Buy vertically/bulk to reduce packaging.";
    }

    // Categories
    if (lowerMsg.includes('plastic')) {
        return "For Plastics:\n1. Check if it's recyclable (PET/HDPE).\n2. Rinse and dry.\n3. Flatten to save space.\n4. Place in the dry/recyclable bin.";
    }

    if (lowerMsg.includes('e-waste') || lowerMsg.includes('electronic')) {
        return "E-waste (phones, wires, gadgets):\n1. Do not dispose in regular trash.\n2. Check if it works (donate/sell).\n3. If broken, take to an e-waste drop-off point.";
    }

    if (lowerMsg.includes('hazard') || lowerMsg.includes('chemical') || lowerMsg.includes('paint')) {
        return "⚠️ Hazardous Waste:\n1. Keep in original container if possible.\n2. Do not mix with other waste.\n3. Contact local hazardous waste facility for pickup/drop-off.";
    }

    // Off-topic or Unknown
    return "I can help you recycle! Try asking 'How to recycle plastic bottles?' or 'How to compost?'";
}

export const chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Please say something!" });

        // Method 1: OpenAI (Preferred)
        if (openai) {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo", // or gpt-4
                    messages: [
                        { role: "system", content: ECOBOT_SYSTEM_PROMPT },
                        { role: "user", content: message }
                    ],
                    max_tokens: 150,
                    temperature: 0.7,
                });

                const reply = completion.choices[0].message.content.trim();
                return res.json({ reply });
            } catch (aiError) {
                console.error("OpenAI Error (Falling back to rules):", aiError.message);
                // Fall through to Method 2
            }
        }

        // Method 2: Fallback Logic
        const reply = getFallbackResponse(message);

        // Record History if userId present
        const { userId } = req.body;
        if (userId) {
            import('./wasteController.js').then(m => {
                m.recordHistory(userId, 'BOT_CHAT', { message, reply });
            }).catch(e => console.error("Chat History Error:", e));
        }

        res.json({ reply });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ reply: "Sorry, I'm having trouble connecting to my eco-brain right now. 🌱" });
    }
};
