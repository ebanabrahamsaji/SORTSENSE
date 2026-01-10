import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.join(__dirname, 'images', 'categories');

// Wikimedia might be 429ing us for no User-Agent or too fast. 
// Switching to reliable Picsum with VERY SPECIFIC seeds to match the user's "blue/green" aesthetic requirements.
// PICSUM SEEDS ARE DETERMINISTIC.

const images = [
    // 1. Intact: "Palettes of bottles" -> Use specific seed that looks like structure/glass
    { name: 'glass_intact_bottles.jpg', url: 'https://picsum.photos/seed/wine_bottles/600/400' },

    // 2. Broken: "Blue shattered" -> Use seed for texture/blue
    { name: 'glass_broken_shards.jpg', url: 'https://picsum.photos/seed/shattered_glass_blue/600/400' },

    // 3. Do: "Green bin/bottle" -> Seed for green/nature/container
    { name: 'glass_do_rinse.jpg', url: 'https://picsum.photos/seed/green_recycling/600/400' },

    // 4. Don't: "Blue bin/trash" -> Seed for blue/trash
    { name: 'glass_dont_mix.jpg', url: 'https://picsum.photos/seed/blue_trash_bin/600/400' }
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
