# Amberg Waste Collection Backend

This backend extracts waste collection dates from Amberg PDF waste collection calendars and serves them via a FastAPI app.

## Features

* 📄 PDF calendar OCR & extraction
* 🧠 EasyOCR preprocessing
* 🧹 Data cleanup
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

   ### Local Development

   For local development without Docker, ensure you have activated the virtual environment and installed dependencies from `src/app/requirements.txt`.

   Then, start the server from the `backend` directory:

   ```bash
   uvicorn src.app.main:app --host 0.0.0.0 --port 5000
   ```

   Note: Rate limiting via Redis will be disabled if Redis is not running.

## API Endpoints

The FastAPI backend provides the following REST endpoints for accessing waste collection data:

### Base URL
- **Development**: `http://localhost:5000`
- **Docker Compose**: `http://localhost/api` (proxied through nginx)

### Endpoints

**Parameters:** `zone_code` : 2-digit zone code (e.g., `A3`)

#### `GET /api/waste-collection/{zone_code}/next`
Returns the next 4 upcoming pickup dates for every waste type for a specific zone.

#### `GET /api/waste-collection/{zone_code}/schedule`
Returns the complete pickup schedule for a specific zone.

#### `GET /ping`
Returns the status of the api (ok and up and running).

#### `GET /docs`
Interactive API documentation (Swagger UI) available at `/docs` endpoint.
