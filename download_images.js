import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.join(__dirname, 'images', 'categories');

// Fallback URLs using Picsum for 404s
const images = [
    { name: 'ewaste_gadgets.jpg', url: 'https://picsum.photos/seed/gadgets/600/400' },
    { name: 'ewaste_cables.jpg', url: 'https://picsum.photos/seed/cables/600/400' },
    { name: 'ewaste_do_dropoff.jpg', url: 'https://picsum.photos/seed/recycle/600/400' },
    { name: 'ewaste_dont_dump.jpg', url: 'https://picsum.photos/seed/dump/600/400' },
    { name: 'hazardous_chemicals.jpg', url: 'https://picsum.photos/seed/chemicals/600/400' },
    { name: 'hazardous_medical.jpg', url: 'https://picsum.photos/seed/medical/600/400' },
    { name: 'hazardous_dont_drain.jpg', url: 'https://picsum.photos/seed/drain/600/400' }
];

async function downloadImages() {
    for (const img of images) {
        const filePath = path.join(targetDir, img.name);
        console.log(`Downloading ${img.name}...`);

        try {
            const response = await axios({
                method: 'GET',
                url: img.url,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            console.log(`✅ Saved ${img.name}`);
        } catch (error) {
            console.error(`❌ Error downloading ${img.name}: ${error.message}`);
        }
    }
}

downloadImages();
