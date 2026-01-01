import easyocr
import cv2
from PIL import Image
import numpy as np
import pandas as pd
from pdf2image import convert_from_path
from tqdm import tqdm

import sys
from pathlib import Path

# Add the parent directory to sys.path to import config
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import config

PDF_PLAN_DIR = config.PDF_PLAN_DIR
OCR_RESULTS_DIR = config.OCR_RESULTS_DIR


# Load and crop the pdf
def _load_pdf_image(pdf_name, box_coords):
    """
    Load a PDF file and crop the first page to the specified bounding box.

    Args:
        pdf_name (str): Name of the PDF file in the PDF_PLAN_DIR.
        box_coords (tuple): (left, top, right, bottom) coordinates for cropping.

    Returns:
        PIL.Image: Cropped image of the PDF page.
    """
    file_path = PDF_PLAN_DIR / pdf_name

    images = convert_from_path(file_path, dpi=300)
    img = images[0]
    cropped = img.crop(box_coords)
    return cropped


# Image preprocessing
def _preprocess_image(image):
    """
    Preprocess a PIL image for OCR by converting to grayscale, enhancing contrast,
    and applying denoising.

    Args:
        image (PIL.Image): Input image to preprocess.

    Returns:
        PIL.Image: Preprocessed grayscale image.
    """
    # PIL → OpenCV
    img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # CLAHE = local contrast enhancement (works for light text on darker backgrounds and dark text on light backgrounds)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # Light denoise (keeps text edges)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)

    # No hard thresholding here, to keep all text in picture
    return Image.fromarray(gray)


def _compute_bounds(total_pixels, parts):
    """
    Compute cumulative integer boundaries for `parts` segments across `total_pixels`.

    Uses float division and rounding to avoid cumulative integer-division drift.
    This ensures even distribution of segments without gaps or overlaps due to rounding.

    Args:
        total_pixels (int): Total number of pixels in the dimension.
        parts (int): Number of segments to divide into.

    Returns:
        list: List of boundary positions, starting with 0 and ending with total_pixels.
    """
    part_f = float(total_pixels) / float(parts)
    bounds = [0]
    for i in range(1, parts + 1):
        bounds.append(int(round(i * part_f)))
    bounds[-1] = total_pixels
    return bounds


def _cell_coords(col_idx, row_idx, col_bounds, row_bounds, overlap, width, height):
    """
    Return clamped (left, top, right, bottom) coords for a cell or None if invalid.

    Adds overlap to capture text near boundaries and clamps to image dimensions.

    Args:
        col_idx (int): Column index of the cell.
        row_idx (int): Row index of the cell.
        col_bounds (list): List of column boundaries.
        row_bounds (list): List of row boundaries.
        overlap (int): Pixels to overlap between cells.
        width (int): Image width.
        height (int): Image height.

    Returns:
        tuple or None: (left, top, right, bottom) or None if invalid.
    """
    left = max(0, col_bounds[col_idx] - overlap)
    right = min(width, col_bounds[col_idx + 1] + overlap)
    top = max(0, row_bounds[row_idx] - overlap)
    bottom = min(height, row_bounds[row_idx + 1] + overlap)
    if right <= left or bottom <= top:
        return None
    return (left, top, right, bottom)


def _upscale_image(img, scale=2):
    """
    Safely upscale a PIL image, falling back on the original on error.

    Uses BICUBIC resampling for quality. If resizing fails, returns original image.

    Args:
        img (PIL.Image): Image to upscale.
        scale (int): Scaling factor (default 2).

    Returns:
        PIL.Image: Upscaled image or original if error.
    """
    try:
        return img.resize(
            (max(1, img.width * scale), max(1, img.height * scale)),
            resample=Image.BICUBIC,
        )
    except Exception:
        return img


def _ocr_from_image(img, reader_obj):
    """
    Run easyocr on a PIL image and return token list (may be empty).

    Converts image to array, performs OCR, and splits text into tokens.

    Args:
        img (PIL.Image): Image to perform OCR on.
        reader_obj: EasyOCR reader object.

    Returns:
        list: List of text tokens from OCR.
    """
    arr = np.array(img)
    if arr.size == 0:
        return []
    texts = reader_obj.readtext(arr, detail=0)
    return " ".join(texts).strip().split()


# Extract the columns/rows and run OCR on those cells
def extract_cells(image, months, rows=31, cols=6, lang=["de", "en"], overlap_px=4):
    """
    Extract text from grid-like image reliably.

    Improvements made:
    - Use fractional cell sizes with cumulative rounding to avoid drift caused by integer division.
    - Add a small overlap (in pixels) between adjacent cells so thin lines or imperfect cropping are still captured.
    - Clamp crop coordinates to image bounds to avoid empty crops at edges.
    - Skip empty crops.

    Args:
        image (PIL.Image): Preprocessed image to extract from.
        months (list): List of month names for columns.
        rows (int): Number of rows in the grid (default 31 for days).
        cols (int): Number of columns (default 6 for months).
        lang (list): Languages for OCR (default ['de', 'en']).
        overlap_px (int): Overlap in pixels between cells (default 4).

    Returns:
        list: List of dictionaries with 'Month', 'Day', 'Text' for each cell.
    """
    width, height = image.size

    col_bounds = _compute_bounds(width, cols)
    row_bounds = _compute_bounds(height, rows)

    reader = easyocr.Reader(lang, gpu=False)
    entries = []

    # Show progress bar in console on OCR extraction
    total = rows * cols
    with tqdm(total=total, desc="Calender cells", unit="cell") as pbar:
        for col in range(cols):
            for row in range(rows):
                coords = _cell_coords(
                    col, row, col_bounds, row_bounds, overlap_px, width, height
                )

                if coords is None:
                    pbar.update(1)
                    continue

                cell_img = image.crop(coords)
                cell_upscaled = _upscale_image(cell_img, scale=2)

                tokens = _ocr_from_image(cell_upscaled, reader)

                entries.append(
                    {
                        "Month": months[col] if col < len(months) else None,
                        "Day": row + 1,
                        "Text": tokens,
                    }
                )

                pbar.update(1)

    return entries


# Run full extraction process
def run_collection_extraction(pdf_name, box_coords, csv_name, months=None):
    """
    Run the full extraction process: load PDF, preprocess, extract cells, and save to CSV.

    Args:
        pdf_name (str): Name of the PDF file.
        box_coords (tuple): Cropping coordinates for the PDF.
        csv_name (str): Name for the output CSV file.
        months (list, optional): List of month names (default Jan-Jun).

    Returns:
        pd.DataFrame: DataFrame of extracted entries.
    """
    if months is None:
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    print(f"📄 Loading PDF: {pdf_name}")
    img = _load_pdf_image(pdf_name, box_coords)

    print("🧪 Preprocessing...")
    processed = _preprocess_image(img)

    print("🔍 OCR per Cell...")
    entries = extract_cells(processed, months)

    print(f"💾 Saved as: {csv_name}")
    df = pd.DataFrame(entries)

    file_path = OCR_RESULTS_DIR / csv_name
    df.to_csv(file_path, index=False)
    return df
