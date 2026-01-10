import os
import requests
import shutil
import random

# Categories
CATEGORIES = ['plastic', 'glass', 'metal', 'organic', 'ewaste', 'hazardous']

# Sample Image URLs (Public domain or permissive license for demo/educational use)
# Using placeholder/sample images ensures the script runs without complex scrapers.
IMAGE_SOURCES = {
    'plastic': [
        "https://images.unsplash.com/photo-1562077981-4d7eafd44932?q=80&w=200", # Bottle
        "https://images.unsplash.com/photo-1620508544078-d01c9053c20c?q=80&w=200", # Plastic bag
        "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=200", # Container
        "https://images.unsplash.com/photo-1542317854-46327b993ae3?q=80&w=200", # Plastic trash
        "https://images.unsplash.com/photo-1520699049698-acd2fcc51056?q=80&w=200", # Bottles
    ],
    'glass': [
        "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=200", # Bottles
        "https://images.unsplash.com/photo-1605634563824-c10d3221b658?q=80&w=200", # Broken glass
        "https://images.unsplash.com/photo-1505252873432-73a7d2c3df31?q=80&w=200", # Jar
        "https://images.unsplash.com/photo-1565620958197-28d84400c401?q=80&w=200", # Glassware
        "https://images.unsplash.com/photo-1516086884033-0668d2b27003?q=80&w=200", # Wine bottle
    ],
    'metal': [
        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=200", # Cans
        "https://images.unsplash.com/photo-1517441221147-b352054fb1d2?q=80&w=200", # Aluminum
        "https://images.unsplash.com/photo-1619623718012-70b7405beba9?q=80&w=200", # Scrap
        "https://images.unsplash.com/photo-1562979207-6f014798e28f?q=80&w=200", # Tin can
        "https://images.unsplash.com/photo-1596489399238-d62153b6d573?q=80&w=200", # Rusty metal
    ],
    'organic': [
        "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=200", # Vegetable peel
        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=200", # Apple core
        "https://images.unsplash.com/photo-1560717849-c430e557297e?q=80&w=200", # Rotten fruit
        "https://images.unsplash.com/photo-1589133446698-508d4b3c79da?q=80&w=200", # Leaves
        "https://images.unsplash.com/photo-1605557626697-2e87166d88f9?q=80&w=200", # Compost
    ],
    'ewaste': [
        "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=200", # Circuit board
        "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=200", # CPU
        "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=200", # Old laptop
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=200", # Keyboard
        "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?q=80&w=200", # Batteries
    ],
    'hazardous': [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200", # Medical waste
        "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?q=80&w=200", # Syringe
        "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=200", # Battery (Hazardous context)
        "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=200", # Chemicals
        "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=200", # Lab waste
    ]
}

DATASET_ROOT = os.path.join(os.path.dirname(__file__), 'dataset')

def setup_directories():
    if os.path.exists(DATASET_ROOT):
        print(f"Dataset folder exists at {DATASET_ROOT}")
        # return # Uncomment to skip if already exists, but for demo we overwrite or add
    
    for split in ['train', 'val']:
        for cat in CATEGORIES:
            path = os.path.join(DATASET_ROOT, split, cat)
            os.makedirs(path, exist_ok=True)

def download_image(url, save_path):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return False

def create_dataset():
    setup_directories()
    
    print("Downloading sample images...")
    
    for cat, urls in IMAGE_SOURCES.items():
        print(f"Processing Category: {cat}")
        
        # Shuffle URLs to randomize train/val split
        random.shuffle(urls)
        
        # Split: 80% train, 20% val (approx)
        split_idx = max(1, int(len(urls) * 0.8))
        train_urls = urls[:split_idx]
        val_urls = urls[split_idx:]
        
        # Download Train
        for i, url in enumerate(train_urls):
            fname = f"{cat}_train_{i}.jpg"
            path = os.path.join(DATASET_ROOT, 'train', cat, fname)
            if not os.path.exists(path):
                download_image(url, path)
                
        # Download Val
        for i, url in enumerate(val_urls):
            fname = f"{cat}_val_{i}.jpg"
            path = os.path.join(DATASET_ROOT, 'val', cat, fname)
            if not os.path.exists(path):
                download_image(url, path)

    print("Dataset setup complete!")

if __name__ == "__main__":
    create_dataset()
