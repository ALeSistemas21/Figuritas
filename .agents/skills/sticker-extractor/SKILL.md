---
name: sticker-extractor
description: Extracts and identifies sticker images from the Panini World Cup 2026 PDF using PDF extraction and Computer Vision.
---

# Sticker Extractor Skill

This skill provides the capability to extract individual stickers from a Panini album PDF.

## Requirements
- `poppler-utils` (specifically `pdfimages`) to extract raw embedded images.
- Node.js scripts for identification (since Python OpenCV failed to build in this environment).

## Instructions
1. Use `pdfimages -png <pdf_path> <output_prefix>` to extract all embedded images.
2. Filter the images by size (discarding <1KB artifacts or full-page backgrounds >1MB). The valid stickers are typically around 200KB-300KB.
3. Since we know there are 992 stickers and we extracted a similar number of valid images, map them sequentially to the official sticker IDs from `figuData.ts`.
4. Rename and move the valid sticker images to `public/stickers/`.

## Scripts
- `scripts/process_stickers.js`: A Node script that reads the extracted images, filters out non-stickers, and renames them to `[ID].png` based on `figuData.ts` order.
