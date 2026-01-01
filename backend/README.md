# Amberg Waste Collection Backend

This backend extracts waste collection dates from Amberg PDF waste collection calendars and serves them via a FastAPI app. It maps streets to their waste collection zones and geographic coordinates for interactive map visualization.

## Features

- 📄 PDF calendar OCR & extraction
- 🧠 EasyOCR preprocessing
- 🧹 Data cleanup
- 📦 JSON output for waste collection per zone
- 🗺️ Street zone mapping extraction and API access
- 🛣️ Street coordinates extraction for interactive map visualization
- 📡 Automatic PDF availability monitoring (path checker)
- 🔗 API to access the extracted data

## Project Structure

```
backend/
├── src/
│   ├── app/                           # FastAPI application
│   │   ├── main.py                    # FastAPI app initialization
│   │   ├── routes.py                  # API endpoint definitions
│   │   ├── file_io.py                 # Data loading and JSON I/O
│   │   ├── logic.py                   # Business logic (filtering, scheduling)
│   │   ├── exceptions.py              # Custom exception classes
│   │   ├── utils.py                   # Utility functions
│   │   ├── ip_utils.py                # IP-based rate limiting helpers
│   │   └── requirements.txt           # API dependencies
│   ├── data_extraction/               # PDF + OCR + Mapping logic
│   │   ├── main.py                    # Main extraction pipeline
│   │   ├── collection_planner_extraction.py  # PDF parsing & calendar extraction
│   │   ├── collection_data_preparation.py    # Data cleaning & normalization
│   │   ├── streets_zone_mapping.py    # Street to zone mapping extraction
│   │   ├── map_extract.py             # Street coordinates extraction (OSM)
│   │   └── requirements.txt           # Data extraction dependencies
│   ├── path_checker/                  # PDF availability monitoring
│   │   ├── download_paths.py          # Background service: monitors PDF availability
│   │   └── requirements.txt           # Path checker dependencies
│   └── config.py                      # Resource paths (environment-aware)
├── resources/                         # Input PDFs and output data
│   ├── pdf_waste_collection_plans/    # Source PDFs (input)
│   ├── ocr_results/                   # Intermediate CSVs from OCR
│   ├── waste_collection_api_data/     # Final JSON output
│   │   ├── waste-collection-2025.json
│   │   └── waste-collection-2026.json
│   ├── street_zones_mapping/          # Street mapping data
│   │   ├── street-zones-mapping.json  # Streets to zone codes
│   │   └── street-coords-mapping.json # Street coordinates for map
│   └── download_links/                # Availability state (auto-generated)
│       └── availability_state.json    # PDF availability info
├── Dockerfile.api                     # Docker image for FastAPI
├── Dockerfile.path_checker            # Docker image for path checker
└── README.md                          # This file
```

## Installation

```bash
# For data extraction only
pip install -r src/data_extraction/requirements.txt

# For API server
pip install -r src/app/requirements.txt

# For PDF availability monitoring (path checker)
pip install -r src/path_checker/requirements.txt
```

## Usage

1. **Place input PDFs** in `resources/pdf_waste_collection_plans/`, named like `MM_MM_YYYY.pdf` where e.g. `01_06` represents the start month (01 for January) and end month (06 for June) of the calendar period (If you use another name, update the file name parameter `src/data_extraction/main.py`)

2. **Edit bounding box** (crop area) in:

   ```python
   # src/data_extraction/main.py
   box_coords = (x1, y1, x2, y2)  # adjust this
   ```

   Use a photo editing tool like [**GIMP**](https://www.gimp.org) to get pixel coordinates for each new calendar.

   - Set top-left corner below the month name tiles, right next to the first month column start
   - Fit the box **snugly** around all 6 month columns
   - Make sure corner points lie in the white surrounding of the month columns

3. **Run full pipeline**:

   ```bash
   python src/data_extraction/main.py
   ```

   This generates CSV and JSON in `resources/`.

   - If the OCR returns unexpected or unusable results, the pipeline will stop with an assertion error.
   - Manual review/fixing of problematic rows is required.

   **Note:** If a new street zone mapping with different or new streets is available, place the updated PDF in `resources/street_zones_mapping/` and run the street mapping extraction script to update `streets-zones-mapping.json`.

4. **Street Coordinates Extraction**:

   The `src/data_extraction/map_extract.py` script extracts street coordinates and their corresponding waste collection zones. It:

   - Downloads the street graph for Amberg using OSMnx
   - Matches street names from the mapping to OSM data using fuzzy matching
   - Extracts line segments with coordinates in [lat, lon] format
   - Outputs `street-coords-mapping.json` to `resources/street_zones_mapping/`

   This data is served via the `/api/waste-collection/street-coordinates-mapping` endpoint for the frontend's interactive map.

5. **Start API**:

   Start the API via the docker-compose.yml file from the root folder. This starts:

   - FastAPI backend (`backend-api`)
   - Frontend (nginx)
   - Redis (for rate limiting)
   - Path checker (`backend-path-checker`) - monitors PDF availability

   ```bash
   docker-compose up
   ```

   ### Local Development

   For local development without Docker, ensure you have activated the virtual environment and installed dependencies.

   **Start the API** from the `backend` directory:

   ```bash
   uvicorn src.app.main:app --host 0.0.0.0 --port 5000
   ```

   **Start the path checker** (optional, monitors PDF availability):

   ```bash
   python src/path_checker/download_paths.py
   ```

   **Notes:**

   - Rate limiting via Redis will be disabled if Redis is not running
   - In local development, resource paths are resolved relative to `backend/src/config.py`
   - In Docker, set `RESOURCES_PATH=/app` environment variable (done automatically in docker-compose.yml)

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

#### `GET /api/waste-collection/street-zone-mapping`

Returns the mapping of street names to their corresponding waste collection zone codes.

#### `GET /api/waste-collection/street-coordinates-mapping`

Returns street coordinates with their corresponding waste collection zone codes for map display.

#### `GET /api/waste-collection/download-links-availability`

Returns the current availability state of downloadable PDF resources from the Amberg website. This data is automatically maintained by the Path Checker background service.

#### `GET /ping`

Returns the status of the api (ok and up and running).

#### `GET /docs`

Interactive API documentation (Swagger UI) available at `/docs` endpoint.

## Background Services

### Path Checker

The path checker (`src/path_checker/download_paths.py`) runs as a background service in Docker and periodically monitors the availability of waste collection PDF documents from the Amberg website.

**Functionality:**

- Checks PDF availability for the last year, current year, and next year
- Tests all available result types (`Listen` and `Kalender`)
- Uses zone `A1` as a proxy (assumes all zones are published together)
- Persists availability state to `resources/download_links/availability_state.json`
- Runs every 3 hours by default

**Configuration:**

- `CHECK_AVAILABILITY_INTERVAL`: Time between availability checks (default: 3 hours)
- `REQUEST_SLEEP_INTERVAL`: Delay between HTTP requests (default: 5 seconds)
- `API_BASE_URL`: URL template for checking PDF availability. Uses placeholders for `{year}`, `{result_type}` (e.g., `Listen`, `Kalender`), and `{zone}` (default: `https://amberg.de/fileadmin/Abfallberatung/Abfuhrkalender/{year}/{result_type}/{zone}.pdf`)
  URL needs to be adjusted if Stadt Amberg ever moves or refactors their file path/naming.
