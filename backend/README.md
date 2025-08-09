# Amberg Waste Collection Backend

This backend extracts waste collection dates from Amberg PDF waste collection calendars and serves them via a FastAPI app.

## Features

* 📄 PDF calendar OCR & extraction
* 🧠 EasyOCR preprocessing
* 🧹 Data cleanup & Bavarian holiday filtering
* 📦 JSON output for waste collection per zone
* 🔗 API to access the extracted data

## Project Structure

```
backend/
├── src/
│   ├── app/                   # FastAPI application
│   ├── data_extraction/       # PDF + OCR logic
│   ├── config.py              # Resource paths
├── resources/                 # Input PDFs and output data
│   ├── input/                 # Source PDFs
│   ├── ocr-results/           # Intermediate CSVs
│   └── waste_collection_api_data/ # Final JSON output
```

## Installation

```bash
pip install -r src/data_extraction/requirements.txt
```

## Usage

1. **Place input PDFs** in `resources/pdf_waste_collection_plans/`, named like `Abfuhrplan_Januar_bis_Juni_YYYY.pdf` (If you use another name, update the file name parameter `src/data_extraction/main.py`)

2. **Edit bounding box** (crop area) in:

   ```python
   # src/data_extraction/main.py
   box_coords = (x1, y1, x2, y2)  # adjust this
   ```

   Use a photo editing tool like [**GIMP**](https://www.gimp.org) to get pixel coordinates for each new calendar.

   * Set top-left corner below the month name tiles, right next to the first month column start
   * Fit the box **snugly** around all 6 month columns
   * Make sure corner points lie in the white surrounding of the month columns

3. **Run full pipeline**:

   ```bash
   python src/data_extraction/main.py
   ```

   This generates CSV and JSON in `resources/`.

   * If the OCR returns unexpected or unusable results, the pipeline will stop with an assertion error.
   * Manual review/fixing of problematic rows is required.

4. **Start API**:

   Start the API via the docker-compose.yml file, which also runs the website, from the root folder

   ```bash
   docker-compose up
   ```

   If you only want to serve the API start the server directly via the container from the backend folder

   ```bash
   docker build -t amberg-backend .
   docker run -p 8000:8000 amberg-backend
   ```

