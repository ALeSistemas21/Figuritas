---
name: pdf-extraction
description: Use when working with PDF files, especially for extracting text and images from them.
---

# PDF Processing and Extraction Skill

When you need to read content or extract images from a PDF file, follow these instructions.

## 1. Reading Text from a PDF
To quickly read text from a PDF, you can directly use the `view_file` tool.
- Pass the absolute path to the `.pdf` file.
- The `view_file` tool will automatically extract and return the text content.

## 2. Extracting Images from a PDF
To extract images from a PDF file, you should use the `pdfimages` command-line tool (part of the `poppler-utils` package). 

### Checking and Installing Dependencies
First, verify if `pdfimages` is available:
```bash
which pdfimages
```
If it is not installed, you can try using a Python script as an alternative fallback.

### Using pdfimages
The best way to extract all images in their original format is:
```bash
pdfimages -all /path/to/input.pdf /path/to/output_prefix
```
- `-all`: Extracts images in their native formats (JPEG, PNG, etc.) instead of raw PPM/PBM.
- `output_prefix`: The prefix for the generated image files (e.g., `extracted/image`). It will create files like `extracted/image-000.jpg`, `extracted/image-001.png`.

### Fallback: Python with PyMuPDF
If `pdfimages` is not available, you can use Python:
1. Create a virtual environment and install `pymupdf` (also known as `fitz`):
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install pymupdf
   ```
2. Write a quick script to extract images (`extract_images.py`):
   ```python
   import fitz # PyMuPDF
   import sys

   pdf_path = sys.argv[1]
   doc = fitz.open(pdf_path)

   for page_index in range(len(doc)):
       page = doc[page_index]
       image_list = page.get_images(full=True)
       for image_index, img in enumerate(image_list, start=1):
           xref = img[0]
           base_image = doc.extract_image(xref)
           image_bytes = base_image["image"]
           image_ext = base_image["ext"]
           image_name = f"image_p{page_index+1}_{image_index}.{image_ext}"
           with open(image_name, "wb") as f:
               f.write(image_bytes)
           print(f"Extracted {image_name}")
   ```
3. Run the script:
   ```bash
   python extract_images.py /path/to/file.pdf
   ```

## 3. After Extraction
Once images are extracted, you can:
- Move them to the `public/` folder of the web app if they are assets to be used in the UI.
- Rename them properly according to the user's requirements.
