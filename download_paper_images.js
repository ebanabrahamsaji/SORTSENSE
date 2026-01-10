import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.join(__dirname, 'images', 'categories');

const images = [
    { name: 'paper_newspapers.jpg', url: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&q=80&w=400' }, // Pile of newspapers
    { name: 'paper_cardboard.jpg', url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&q=80&w=400' }, // Brown cardboard texture
    { name: 'paper_do_bundle.jpg', url: 'https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&q=80&w=600' } // Stacked/Bundled paper
];

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

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
