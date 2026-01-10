import sys
import json
import os
import contextlib
import logging

# Configure logging to stderr to keep stdout clean for JSON
logging.basicConfig(stream=sys.stderr, level=logging.ERROR)

# Redirect stdout to stderr to prevent polluting the JSON output
@contextlib.contextmanager
def suppress_stdout():
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout

try:
    with suppress_stdout():
        from ultralytics import YOLO
        import cv2
        import numpy as np
except ImportError as e:
    # Output error as JSON
    print(json.dumps({"error": f"Missing Dependency: {str(e)}"}))
    sys.exit(1)

# --- Configuration ---
# Strict Confidence Configuration
CONF_THRESHOLD = 0.25 # Lower threshold to catch items, will filter later

# --- Strict Material & Category Mapping ---
# Format: 'class_name': {'material': '...', 'category': '...', 'hazardous': bool}
STRICT_MAPPING = {
    # Custom Model Classes (Assumption based on typical waste datasets)
    'plastic': {'material': 'Plastic', 'category': 'Dry Waste', 'hazardous': False},
    'paper': {'material': 'Paper', 'category': 'Dry Waste', 'hazardous': False},
    'metal': {'material': 'Metal', 'category': 'Dry Waste', 'hazardous': False},
    'glass': {'material': 'Glass', 'category': 'Dry Waste', 'hazardous': False},
    'organic': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'ewaste': {'material': 'Electronic Components', 'category': 'Hazardous Waste', 'hazardous': True},
    'trash': {'material': 'Mixed Waste', 'category': 'Uncertain', 'hazardous': False},
    'cardboard': {'material': 'Paper', 'category': 'Dry Waste', 'hazardous': False},
    'battery': {'material': 'Battery', 'category': 'Hazardous Waste', 'hazardous': True},
    'biological': {'material': 'Bio-medical', 'category': 'Hazardous Waste', 'hazardous': True},
    
    # Common COCO Classes
    'bottle': {'material': 'Plastic', 'category': 'Dry Waste', 'hazardous': False}, # Default, refinable
    'cup': {'material': 'Plastic', 'category': 'Dry Waste', 'hazardous': False},    # Default
    'wine glass': {'material': 'Glass', 'category': 'Dry Waste', 'hazardous': False},
    'fork': {'material': 'Plastic', 'category': 'Dry Waste', 'hazardous': False},   # Default
    'knife': {'material': 'Metal', 'category': 'Dry Waste', 'hazardous': False},    # Default
    'spoon': {'material': 'Plastic', 'category': 'Dry Waste', 'hazardous': False},  # Default
    'bowl': {'material': 'Plastic', 'category': 'Dry Waste', 'hazardous': False},
    'can': {'material': 'Metal', 'category': 'Dry Waste', 'hazardous': False}, # Pseudo-class
    'banana': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'apple': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'sandwich': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'orange': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'broccoli': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'carrot': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'hot dog': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'pizza': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'donut': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'cake': {'material': 'Organic Matter', 'category': 'Wet Waste', 'hazardous': False},
    'laptop': {'material': 'E-Waste', 'category': 'Hazardous Waste', 'hazardous': True},
    'mouse': {'material': 'E-Waste', 'category': 'Hazardous Waste', 'hazardous': True},
    'remote': {'material': 'E-Waste', 'category': 'Hazardous Waste', 'hazardous': True},
    'keyboard': {'material': 'E-Waste', 'category': 'Hazardous Waste', 'hazardous': True},
    'cell phone': {'material': 'E-Waste', 'category': 'Hazardous Waste', 'hazardous': True},
    'book': {'material': 'Paper', 'category': 'Dry Waste', 'hazardous': False},
    'vase': {'material': 'Ceramic/Glass', 'category': 'Dry Waste', 'hazardous': False},
    'scissors': {'material': 'Metal', 'category': 'Dry Waste', 'hazardous': False},
    'monitor': {'material': 'E-Waste', 'category': 'Hazardous Waste', 'hazardous': True},
    'tv': {'material': 'E-Waste', 'category': 'Hazardous Waste', 'hazardous': True},
}

# --- Model Loading ---
model = None
try:
    with suppress_stdout():
        # Priority: Custom Best -> Medium -> Nano
        chk_paths = ['best.pt', 'yolov8m.pt', 'yolov8n.pt']
        base_dir = os.path.dirname(__file__)
        cwd = os.getcwd()
        
        found_model = False
        for p in chk_paths:
            # Check relative to script and cwd
            full_p1 = os.path.join(base_dir, p)
            full_p2 = os.path.join(cwd, p)
            if os.path.exists(full_p1):
                model = YOLO(full_p1)
                found_model = True
                break
            if os.path.exists(full_p2):
                model = YOLO(full_p2)
                found_model = True
                break
        
        if not found_model:
            # Fallback to download 'yolov8n.pt' if nothing exists
            model = YOLO('yolov8n.pt')
            
except Exception as e:
    pass # Handle later if needed, but model is essential

def get_confidence_level(conf_score):
    if conf_score >= 0.75: return "High"
    if conf_score >= 0.50: return "Medium"
    return "Low"

def glass_plastic_heuristic(img):
    """
    Heuristic to distinguish Glass vs Plastic.
    Glass: Sharper edges (specular highlights), High Contrast.
    Plastic: Smoother, softer edges.
    """
    try:
        if img is None: return "Plastic"
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Edge density check
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size
        brightness = np.mean(gray)

        # Glass threshold
        if edge_density > 0.05 and brightness > 130:
            return "Glass"
        
        return "Plastic"
    except:
        return "Plastic"

def preprocess_image(image_path):
    try:
        img = cv2.imread(image_path)
        if img is None: return None
        # Basic resizing for consistent inference
        img = cv2.resize(img, (640, 640))
        return img
    except:
        return None

def classify_image(image_path):
    if not model:
         return {
            "object_name": "Error",
            "material": "Unknown",
            "waste_category": "Uncertain",
            "hazardous": False,
            "confidence": "Low"
        }

    img = preprocess_image(image_path)
    if img is None:
         return {
            "object_name": "Error",
            "material": "Unknown",
            "waste_category": "Uncertain",
            "hazardous": False,
            "confidence": "Low"
        }

    try:
        with suppress_stdout():
            results = model(img, verbose=False)

        if not results:
             return {
                "object_name": "Unknown",
                "material": "Unknown",
                "waste_category": "Uncertain",
                "hazardous": False,
                "confidence": "Low"
            }

        result = results[0]
        
        # Get best detection
        if len(result.boxes) == 0:
             # Try classification head if no boxes (cls models)
             if hasattr(result, 'probs') and result.probs is not None:
                 top1_idx = result.probs.top1
                 name = result.names[top1_idx]
                 conf = float(result.probs.top1conf)
             else:
                 return {
                    "object_name": "Unknown",
                    "material": "Unknown",
                    "waste_category": "Uncertain",
                    "hazardous": False,
                    "confidence": "Low"
                }
        else:
             # Detection model logic
             box = result.boxes[0] # Top 1
             name = model.names[int(box.cls[0])]
             conf = float(box.conf[0])

        # --- Rule Application ---
        
        name_lower = name.lower()
        
        # 1. Lookup in Strict Mapping
        mapping = STRICT_MAPPING.get(name_lower)
        
        # 2. Heuristics for Ambiguity
        if not mapping:
             # Fallback logic for unmapped items
             final_name = name.title()
             final_material = "Unknown"
             final_category = "Uncertain"
             final_hazard = False
             
             # Attempt to guess based on substrings
             if 'plastic' in name_lower:
                 mapping = STRICT_MAPPING['plastic']
             elif 'glass' in name_lower:
                 mapping = STRICT_MAPPING['glass']
             elif 'paper' in name_lower:
                 mapping = STRICT_MAPPING['paper']
             elif 'metal' in name_lower:
                 mapping = STRICT_MAPPING['metal']
        
        if mapping:
            final_name = name.title()
            final_material = mapping['material']
            final_category = mapping['category']
            final_hazard = mapping['hazardous']
            
            # Special Case: Bottle/Cup refinement
            if name_lower in ['bottle', 'cup', 'plastic_bottle', 'glass_bottle']:
                detected_mat = glass_plastic_heuristic(img)
                # If heuristic says Glass, and we aren't sure it's Plastic...
                # Actually, stick to material definition.
                # If mapping was 'Plastic' but heuristic strongly says Glass?
                # User said: "A crushed plastic bottle MUST still be classified as... Plastic"
                # So we should rely on the class name if possible. 
                # But if class is generic 'bottle', we need the heuristic.
                
                if name_lower == 'bottle':
                    final_material = detected_mat
                    final_category = "Dry Waste" # Both glass and plastic are dry
                
                # If custom model says 'plastic_bottle', TRUST IT. Do not use heuristic.
                elif name_lower == 'plastic_bottle':
                     final_material = "Plastic (PET)"
                elif name_lower == 'glass_bottle':
                     final_material = "Glass"
        else:
            final_name = name.title()
            # Default fallback
            final_material = "Unknown"
            final_category = "Uncertain" 
            final_hazard = False

        return {
            "object_name": final_name,
            "material": final_material,
            "waste_category": final_category,
            "hazardous": final_hazard,
            "confidence": get_confidence_level(conf)
        }

    except Exception as e:
         return {
            "object_name": "Error",
            "material": "Error",
            "waste_category": "Uncertain",
            "hazardous": False,
            "confidence": "Low"
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = classify_image(image_path)
    print(json.dumps(result))
