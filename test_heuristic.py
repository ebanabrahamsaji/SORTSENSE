
import cv2
import numpy as np
import sys

def test_heuristic(image_path):
    img = cv2.imread(image_path)
    if img is None:
        print("Failed to load image")
        return

    # Preprocess logic from api.py (CLAHE)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    edge_density = np.sum(edges > 0) / edges.size
    brightness = np.mean(gray)

    print(f"Edge Density: {edge_density}")
    print(f"Brightness: {brightness}")

    if edge_density > 0.12:
        print("Result: None (Too Complex)")
    elif edge_density > 0.06 and brightness > 140:
        print("Result: Glass")
    elif edge_density > 0.01:
        print("Result: Plastic")
    else:
        print("Result: Plastic (Default)")

if __name__ == "__main__":
    test_heuristic(r"C:/Users/Eban/.gemini/antigravity/brain/de8c68f8-7c9a-4792-82d0-a2f74063c40a/uploaded_image_0_1767976336330.png")
