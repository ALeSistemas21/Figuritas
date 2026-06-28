import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET() {
  const projectRoot = process.cwd();
  
  // 1. Get Missing IDs
  const seedPath = path.join(projectRoot, 'scratch/seed_figuritas.sql');
  const stickersDir = path.join(projectRoot, 'public/stickers');
  
  const seedContent = fs.readFileSync(seedPath, 'utf8');
  const idRegex = /\('([^']+)',\s*'[^']+',\s*'[^']+',\s*'([^']+)'\)/g;
  const expectedData = [];
  let match;
  while ((match = idRegex.exec(seedContent)) !== null) {
      expectedData.push({ id: match[1], name: match[2] });
  }
  
  const actualFiles = fs.existsSync(stickersDir) ? fs.readdirSync(stickersDir).filter(f => f.endsWith('.png')) : [];
  const actualIds = new Set(actualFiles.map(f => f.replace('.png', '')));
  const missingData = expectedData.filter(d => !actualIds.has(d.id));

  // 2. Get Available Images
  const tempDir = path.join(projectRoot, 'public/temp_recovery');
  const images = [];
  const categories = ['web'];
  
  for (const cat of categories) {
      const catPath = path.join(tempDir, cat);
      if (fs.existsSync(catPath)) {
          const files = fs.readdirSync(catPath).filter(f => f.endsWith('.png'));
          for (const file of files) {
              const fullPath = path.join(catPath, file);
              const stat = fs.statSync(fullPath);
              const sizeKb = stat.size / 1024;
              if (sizeKb >= 10) {
                  images.push({
                      category: cat,
                      filename: file,
                      url: `/temp_recovery/${cat}/${file}`,
                      isGrid: sizeKb > 1000 // If > 1MB, it's a 4x4 grid
                  });
              }
          }
      }
  }

  // Sort images (grids first, then individuals, then by category)
  images.sort((a, b) => {
      if (a.isGrid !== b.isGrid) return a.isGrid ? -1 : 1;
      return a.category.localeCompare(b.category) || a.filename.localeCompare(b.filename);
  });

  return NextResponse.json({ missingIds: missingData, images });
}

export async function POST(request: Request) {
  try {
      const { id, category, filename, isGrid, gridIndex, massAssignTeam } = await request.json();
      const projectRoot = process.cwd();
      const sourcePath = path.join(projectRoot, 'public/temp_recovery', category, filename);

      if (!fs.existsSync(sourcePath)) {
          return NextResponse.json({ error: 'Source file not found' }, { status: 404 });
      }

      if (massAssignTeam && isGrid) {
          // Mass Assign entire 4x4 grid to TEAM2 to TEAM17
          const image = sharp(sourcePath);
          const metadata = await image.metadata();
          const stickerWidth = Math.floor((metadata.width || 0) / 4);
          const stickerHeight = Math.floor((metadata.height || 0) / 4);

          for (let i = 0; i < 16; i++) {
              const row = Math.floor(i / 4);
              const col = i % 4;
              const currentId = `${massAssignTeam}${i + 2}`; // +2 because player faces usually start at 2
              const destPath = path.join(projectRoot, 'public/stickers', `${currentId}.png`);
              
              await image.clone().extract({
                  left: col * stickerWidth,
                  top: row * stickerHeight,
                  width: stickerWidth,
                  height: stickerHeight
              }).toFile(destPath);
          }

          return NextResponse.json({ success: true, massAssigned: true });
      }

      const destPath = path.join(projectRoot, 'public/stickers', `${id}.png`);

      if (isGrid && typeof gridIndex === 'number') {
          // It's a grid (4x4 = 16 stickers). gridIndex is 0 to 15.
          const row = Math.floor(gridIndex / 4);
          const col = gridIndex % 4;
          
          const image = sharp(sourcePath);
          const metadata = await image.metadata();
          const stickerWidth = Math.floor((metadata.width || 0) / 4);
          const stickerHeight = Math.floor((metadata.height || 0) / 4);

          await image.extract({
              left: col * stickerWidth,
              top: row * stickerHeight,
              width: stickerWidth,
              height: stickerHeight
          }).toFile(destPath);
      } else {
          // Individual image, just copy
          fs.copyFileSync(sourcePath, destPath);
      }

      return NextResponse.json({ success: true, id });
  } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
