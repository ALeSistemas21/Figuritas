const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const projectRoot = path.join(__dirname, '../../../../');
const extractDir = path.join(projectRoot, 'scratch/extracted');
const outputDir = path.join(projectRoot, 'public/stickers');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read seed_figuritas.sql to get the list of stickers
const seedPath = path.join(projectRoot, 'scratch/seed_figuritas.sql');
const seedContent = fs.readFileSync(seedPath, 'utf8');

// The IDs are in `('ID', ` format.
const idRegex = /\('([^']+)',/g;
const stickerIds = [];
let match;
while ((match = idRegex.exec(seedContent)) !== null) {
    stickerIds.push(match[1]);
}

console.log(`Found ${stickerIds.length} stickers in seed_figuritas.sql`);

async function processImages() {
    const files = fs.readdirSync(extractDir)
                    .filter(f => f.endsWith('.png'))
                    .sort((a,b) => {
                        const numA = parseInt(a.match(/img-(\d+)/)[1]);
                        const numB = parseInt(b.match(/img-(\d+)/)[1]);
                        return numA - numB;
                    });

    let currentStickerIndex = 0;

    for (const file of files) {
        const filePath = path.join(extractDir, file);
        const stat = fs.statSync(filePath);
        const sizeKb = stat.size / 1024;
        
        if (sizeKb < 10) {
            console.log(`Skipping ${file} (${Math.round(sizeKb)}KB) - Artifact`);
            continue;
        }

        if (currentStickerIndex >= stickerIds.length) {
            console.warn(`Already processed all ${stickerIds.length} stickers! Extra file: ${file}`);
            continue;
        }

        if (sizeKb > 1000) {
            // Large image -> Assume 4x4 Grid
            console.log(`Slicing ${file} (${Math.round(sizeKb)}KB) as 4x4 grid...`);
            const image = sharp(filePath);
            const metadata = await image.metadata();
            
            const stickerWidth = Math.floor(metadata.width / 4);
            const stickerHeight = Math.floor(metadata.height / 4);

            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    if (currentStickerIndex >= stickerIds.length) break;

                    const id = stickerIds[currentStickerIndex];
                    const outPath = path.join(outputDir, `${id}.png`);
                    
                    await image.clone().extract({
                        left: col * stickerWidth,
                        top: row * stickerHeight,
                        width: stickerWidth,
                        height: stickerHeight
                    }).toFile(outPath);
                    
                    console.log(`Extracted grid sticker: ${id}.png`);
                    currentStickerIndex++;
                }
            }
        } else {
            // Individual sticker
            const id = stickerIds[currentStickerIndex];
            const outPath = path.join(outputDir, `${id}.png`);
            fs.copyFileSync(filePath, outPath);
            console.log(`Copied individual sticker: ${id}.png`);
            currentStickerIndex++;
        }
    }
    
    console.log(`Finished processing! Extracted ${currentStickerIndex} stickers.`);
}

processImages().catch(err => console.error(err));
