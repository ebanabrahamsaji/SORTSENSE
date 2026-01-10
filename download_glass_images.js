import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.join(__dirname, 'images', 'categories');

const images = [
    {
        name: 'glass_intact_bottles.jpg',
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Empty_wine_bottles_stacked_in_pallets.jpg'
    },
    {
        name: 'glass_broken_shards.jpg',
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Broken_glass.jpg'
    },
    {
        name: 'glass_do_rinse.jpg',
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Washing_dishes.jpg' // "Washing_dishes" or "Washingdishes" - trying safer common
    },
    {
        name: 'glass_dont_mix.jpg',
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Garbage_Bin.JPG'
    }
];

// Fallback for Washing if specific file fails (wiki is case sensitive often)
const fallbackImages = [
    { name: 'glass_do_rinse.jpg', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Washingdishes.jpg' }
]

async function downloadImages() {
    for (const img of images) {
        const filePath = path.join(targetDir, img.name);
        console.log(`Downloading ${img.name} from Wikimedia...`);

        try {
            const response = await axios({
                method: 'GET',
                url: img.url,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (SortSense Educational App)'
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
            // Try fallback for rinse
            if (img.name === 'glass_do_rinse.jpg') {
                try {
                    console.log("Trying fallback for rinse...");
                    const fallback = fallbackImages[0];
                    const response = await axios({
                        method: 'GET',
                        url: fallback.url,
                        responseType: 'stream',
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    const writer = fs.createWriteStream(filePath);
                    response.data.pipe(writer);
                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });
                    console.log(`✅ Saved ${img.name} (Fallback)`);
                } catch (e) {
                    console.error("Fallback failed too.");
                }
            }
        }
    }
}

downloadImages();
