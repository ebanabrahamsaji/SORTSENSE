const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const cors = require("cors"); // Added for good measure if frontend is on different port, though prompt didnt explicitly ask for usage in code, it asked to install it.

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors()); // Enable CORS

app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const form = new FormData();
        form.append("image", fs.createReadStream(req.file.path));

        const aiResponse = await axios.post(
            "http://127.0.0.1:5001/detect",
            form,
            { headers: form.getHeaders() }
        );

        const detected = aiResponse.data.items;
        // Check if detected array is empty to avoid errors
        const firstItem = detected && detected.length > 0 ? detected[0] : "unknown";
        const disposal = getDisposalRules(firstItem);

        res.json({
            detectedItem: firstItem,
            disposal
        });
    } catch (error) {
        console.error("Error processing image:", error.message);
        res.status(500).json({ error: "Failed to process image", details: error.message });
    }
});

function getDisposalRules(item) {
    if (!item) return "General waste – follow local segregation rules.";

    const lowerItem = item.toLowerCase();
    if (lowerItem.includes("battery")) {
        return "Hazardous waste – take to authorized collection center. Wear gloves & mask.";
    }
    if (lowerItem.includes("bottle") || lowerItem.includes("plastic")) {
        return "Plastic waste – clean and give to plastic collection unit.";
    }
    return "General waste – follow local segregation rules.";
}

app.listen(3000, () => {
    console.log("Node backend running on port 3000");
});
