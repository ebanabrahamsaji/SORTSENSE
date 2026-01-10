from ultralytics import YOLO
import os
import yaml

# --- Configuration ---
EPOCHS = 20
IMG_SIZE = 224
BATCH = 16
DATA_DIR = os.path.join(os.getcwd(), 'ml', 'dataset')
PROJECT_DIR = os.path.join(os.getcwd(), 'ml', 'runs')
NAME = 'waste_cls_model'

def train():
    print("========================================")
    print("   SortSense: Classification Training   ")
    print("========================================")
    
    # Check for train directory
    train_path = os.path.join(DATA_DIR, 'train')
    if not os.path.exists(train_path):
        print(f"❌ Error: Dataset not found at {train_path}")
        return

    # Load Classification Model
    print("Load YOLOv8 Classification Model...")
    model = YOLO('yolov8n-cls.pt')

    try:
        # Train
        model.train(
            data=DATA_DIR,
            epochs=EPOCHS,
            imgsz=IMG_SIZE,
            device='cpu',
            batch=BATCH,
            project=PROJECT_DIR,
            name=NAME,
            exist_ok=True
        )
        print("✅ Training Complete.")
        print(f"Model saved to {PROJECT_DIR}/{NAME}/weights/best.pt")

    except Exception as e:
        print(f"❌ Training Error: {e}")

if __name__ == '__main__':
    train()
