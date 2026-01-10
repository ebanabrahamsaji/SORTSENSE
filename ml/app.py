from flask import Flask, request, jsonify
from ultralytics import YOLO
from PIL import Image
import os

app = Flask(__name__)

# --- Load Model ---
# Load locally trained model 'best.pt' if available, else 'yolov8m.pt'
MODEL_PATH = "best.pt"
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "yolov8m.pt" # Fallback to standard medium model
    # simplified fallback if medium not found, usually ultralytics downloads it automatically
    
try:
    model = YOLO(MODEL_PATH)
    print(f"Model loaded: {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# --- Configuration ---
# Map COCO classes to our Categories if using generic model
# If using custom trained 'best.pt', these classes will come from the model itself
GENERIC_MAPPING = {
    'bottle': 'Plastic',
    'cup': 'Plastic',
    'bowl': 'Plastic', # Generic assumption
    'banana': 'Organic',
    'apple': 'Organic',
    'sandwich': 'Organic',
    'orange': 'Organic',
    'broccoli': 'Organic',
    'carrot': 'Organic',
    'pizza': 'Organic',
    'donut': 'Organic',
    'cake': 'Organic',
    'chair': 'Wood', # Example
    'couch': 'Fabric',
    'potted plant': 'Organic',
    'tv': 'E-waste',
    'laptop': 'E-waste',
    'mouse': 'E-waste',
    'remote': 'E-waste',
    'keyboard': 'E-waste',
    'cell phone': 'E-waste',
    'microwave': 'E-waste',
    'oven': 'E-waste',
    'toaster': 'E-waste',
    'refrigerator': 'E-waste',
    'book': 'Paper',
    'clock': 'Plastic',
    'vase': 'Ceramic',
    'scissors': 'Metal',
    'teddy bear': 'Fabric',
    'toothbrush': 'Plastic',
}

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "Online",
        "service": "Waste Analysis API (Detection)",
        "model": MODEL_PATH
    })

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Load image with PIL directly from stream
        img = Image.open(file.stream)
        
        # Run Inference
        results = model(img)
        
        # Process Results
        best_conf = 0.0
        best_cat = "Unknown"
        
        if results and len(results) > 0:
            result = results[0]
            
            # Check if any boxes detected
            if result.boxes:
                # Get the box with highest confidence
                box = max(result.boxes, key=lambda x: x.conf[0])
                class_id = int(box.cls[0])
                conf = float(box.conf[0])
                class_name = model.names[class_id]

                # --- Category Mapping ---
                # Check if we are using custom model classes or need to map generic COCO classes
                if 'best.pt' in MODEL_PATH:
                     # Assuming custom model is trained on: plastic, glass, metal, organic, e-waste, hazardous
                    best_cat = class_name.capitalize()
                else:
                    # Map generic classes
                    best_cat = GENERIC_MAPPING.get(class_name, "Uncertain") 
                    # If uncertain but high confidence detection of *something*, send raw name
                    if best_cat == "Uncertain":
                         best_cat = f"Uncertain ({class_name})"

                best_conf = round(conf * 100, 2)
            else:
                 best_cat = "No Waste Detected"
                 best_conf = 0.0

        return jsonify({
            "category": best_cat,
            "confidence": best_conf
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 8000 as requested
    app.run(host='0.0.0.0', port=8000, debug=True)
