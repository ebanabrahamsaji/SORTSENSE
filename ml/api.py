import os
import sys
import numpy as np
import cv2
from flask import Flask, request, jsonify
from ultralytics import YOLO

app = Flask(__name__)

# --- Configuration ---
FIXED_CATEGORIES = ['plastic', 'glass', 'metal', 'organic', 'ewaste', 'hazardous', 'paper', 'textile', 'mixed']

# Kerala Guidelines
KERALA_GUIDELINES = {
    'plastic': "Wash and dry. Hand over to Haritha Karma Sena / Plastic collection centers.",
    'glass': "Clean and hand over to authorized recycling centers. Handle with care.",
    'metal': "Clean and hand over to scrap dealers for recycling.",
    'organic': "Use for home composting or biogas. Do not mix with plastic.",
    'ewaste': "Hand over to government-approved e-waste collection centers. Do not burn.",
    'hazardous': "Do not mix with other waste. Hand over to special collection facilities.",
    'paper': "Keep dry. Bundle and hand over to scrap dealers or paper recycling units.",
    'textile': "Clean clothes can be donated. Rags should be handed over to collection centers.",
    'mixed': "Segregate if possible. Non-recyclables go to sanitary landfills."
}

# --- Model Loading ---
CUSTOM_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'best.pt')
custom_model = None
generic_model = None

def load_models():
    global custom_model, generic_model
    
    # 1. Custom Trained Model
    try:
        if os.path.exists(CUSTOM_MODEL_PATH):
            print(f"Loading Custom Model: {CUSTOM_MODEL_PATH}")
            custom_model = YOLO(CUSTOM_MODEL_PATH)
        else:
            print("Custom model not found. Training required.")
    except Exception as e:
        print(f"Error loading custom model: {e}")

    # 2. Generic Model (Fallback)
    try:
        print("Loading Generic Fallback Model (yolov8n-cls.pt)...")
        generic_model = YOLO('yolov8n-cls.pt')
    except Exception as e:
        print(f"Error loading generic model: {e}")

load_models()

def predict_with_model(model_obj, img):
    """Run inference and return (class_name, confidence)"""
    if not model_obj: return None, 0.0
    
    results = model_obj(img, verbose=False)
    if not results: return None, 0.0
    
    result = results[0]
    if hasattr(result, 'probs') and result.probs is not None:
        idx = result.probs.top1
        return result.names[idx], float(result.probs.top1conf)
    if hasattr(result, 'boxes') and len(result.boxes) > 0:
        # If generic model was accidentally a detection model, handle it
        box = result.boxes[0]
        return model_obj.names[int(box.cls[0])], float(box.conf[0])

    return None, 0.0

def preprocess_image(img_stream):
    try:
        file_bytes = np.asarray(bytearray(img_stream.read()), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        return img
    except:
        return None

def normalize_category(raw_name):
    name = raw_name.lower().replace('_', ' ')
    
    # 1. Direct Match
    if name in FIXED_CATEGORIES: return name
    
    # 2. Comprehensive ImageNet Mapping
    
    # --- HAZARDOUS (High Priority) ---
    hazardous_terms = [
        'battery', 'syringe', 'hypodermic syringe', 'pill', 'medicine', 'chemical', 'toxic', 'poison', 'acid'
    ]
    if any(x in name for x in hazardous_terms): return 'hazardous'

    # --- PLASTIC ---
    plastic_terms = [
        'water bottle', 'pop bottle', 'soda bottle', 'plastic bag', 'nipple', 'lotion', 
        'sunscreen', 'hair spray', 'pill bottle', 'washbasin', 'bucket', 'crate', 
        'plastic', 'poly', 'container', 'tub', 'cup', 'espresso', 'coffee mug', 
        'ping-pong ball', 'packet', 'wrapper', 'mask', 'rubber', 'ballpoint'
    ]
    if any(x in name for x in plastic_terms): return 'plastic'

    # --- GLASS ---
    glass_terms = [
        'wine bottle', 'beer bottle', 'glass', 'goblet', 'vase', 'beaker', 'flask', 
        'perfume', 'pitcher', 'jar', 'sunglass', 'spectacle', 'lens', 'mirror'
    ]
    if any(x in name for x in glass_terms): return 'glass'

    # --- METAL ---
    metal_terms = [
        'can', 'tin', 'lighter', 'safety pin', 'hook', 'corkscrew', 'spatula', 
        'cleaver', 'knife', 'fork', 'spoon', 'bicycle', 'wheel', 'rim', 'toaster', 'iron',
        'chain', 'padlock', 'nail', 'screw', 'bolt', 'hammer', 'wrench', 'screwdriver'
    ]
    if any(x in name for x in metal_terms): return 'metal'

    # --- ORGANIC ---
    organic_terms = [
        'banana', 'apple', 'orange', 'lemon', 'fig', 'pineapple', 'pomegranate', 
        'broccoli', 'cauliflower', 'cucumber', 'zucchini', 'bell pepper', 'mushroom', 
        'corn', 'strawberry', 'pizza', 'hamburger', 'sandwich', 'bread', 'cake', 
        'hot dog', 'mashed potato', 'head cabbage', 'food', 'fruit', 'vegetable', 'plant',
        'meat', 'chicken', 'fish', 'egg', 'cheese', 'leaf', 'flower', 'tree'
    ]
    if any(x in name for x in organic_terms): return 'organic'
    
    # --- E-WASTE ---
    ewaste_terms = [
        'keyboard', 'mouse', 'laptop', 'notebook computer', 'desktop', 'monitor', 'screen', 
        'television', 'radio', 'cassette', 'tape player', 'ipod', 'modem', 'cell', 
        'phone', 'remote', 'joystick', 'printer', 'hard disc', 'projector', 
        'vacuum', 'calculator', 'camera', 'lens', 'battery', 'charger', 'plug',
        'computery keyboard', 'typewriter keyboard', 'space bar', 'keypad'
    ]
    if any(x in name for x in ewaste_terms): return 'ewaste'
    
    # --- PAPER (More Robust) ---
    paper_terms = [
        'book', 'paper', 'cardboard', 'carton', 'envelope', 'tissue', 'toilet paper', 
        'binder', 'menu', 'comic', 'passport', 'ticket', 'crossword', 'puzzle', 
        'newspaper', 'magazine', 'leaflet', 'flyer', 'box', 'packet'
    ]
    if any(x in name for x in paper_terms): return 'paper'

    # --- TEXTILE (Ultra Expanded) ---
    textile_terms = [
        'jean', 'wool', 'velvet', 'cloth', 'shirt', 'jersey', 'maillot', 'diaper', 'sock', 'mitten',
        'gown', 'cloak', 'coat', 'suit', 'sweater', 'cardigan', 'robe', 'apron', 'cap', 'hat', 
        'towel', 'sheet', 'pillow', 'quilt', 'rug', 'carpet', 'curtain', 'umbrella', 'wallet', 'purse', 
        'backpack', 'bag', 't-shirt', 'pants', 'trousers', 'shorts', 'skirt', 'dress', 'scarf', 'tie',
        'glove', 'jacket', 'vest', 'sock', 'stocking', 'nylon', 'silk', 'cotton', 'linen', 'fabric',
        'canvas', 'shoe', 'boot', 'sandal', 'slipper', 'sneaker'
    ]
    if any(x in name for x in textile_terms): return 'textile'
    
    # --- MIXED (Expanded) ---
    mixed_terms = [
        'trash', 'garbage', 'rubbish', 'ashcan', 'safe', 'shopping cart', 'waste', 'litter', 'debris',
        'bin', 'dumpster'
    ]
    if any(x in name for x in mixed_terms): return 'mixed'

    return None


@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({"category": "unknown", "confidence": 0.0})

        file = request.files['image']
        img = preprocess_image(file.stream)
        if img is None: return jsonify({"category": "unknown", "confidence": 0.0})

        final_cat = None
        final_conf = 0.0

        # --- STRATEGY: GENERIC MODEL FIRST (Restored Stability) ---
        gen_name, gen_conf = predict_with_model(generic_model, img)
        if gen_name:
            mapped_cat = normalize_category(gen_name)
            if mapped_cat:
                final_cat = mapped_cat
                final_conf = gen_conf
                print(f"✅ Generic Model Match: {gen_name} -> {final_cat} ({final_conf:.2f})")

        # --- STRATEGY: CUSTOM MODEL (Backup) ---
        # Only check custom model if Generic didn't find anything confident
        if not final_cat and custom_model:
            cust_name, cust_conf = predict_with_model(custom_model, img)
            if cust_name:
                norm_cust = cust_name.lower()
                # Use standard 0.40 threshold for stability
                if norm_cust in FIXED_CATEGORIES and cust_conf > 0.40: 
                    final_cat = norm_cust
                    final_conf = cust_conf
                    print(f"⚠️ Generic failed. Used Custom Model: {final_cat} ({final_conf:.2f})")

        # --- STRATEGY: SAFETY NET ---
        if not final_cat:
            final_cat = 'organic'
            final_conf = 0.30
            print("❌ Both models failed. Fallback to Organic.")

        # Rescue Rule (Strict)
        if final_cat == 'hazardous' and final_conf < 0.60:
            final_cat = 'plastic'

        return jsonify({
            "category": final_cat,
            "confidence": round(final_conf * 100, 2),
            "disposal_guidance": KERALA_GUIDELINES.get(final_cat, "Dispose according to local regulations.")
        })

    except Exception as e:
        print(f"Analysis Error: {e}")
        return jsonify({"category": "error", "confidence": 0.0})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
