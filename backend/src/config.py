import os
from pathlib import Path

# In Docker, RESOURCES_PATH is set; in local dev, derive from file location
if os.getenv("RESOURCES_PATH"):
    BASE_DIR = Path(os.getenv("RESOURCES_PATH"))
else:
    # Local development: go up 2 levels from config.py (src -> backend)
    BASE_DIR = Path(__file__).resolve().parents[1]

OCR_RESULTS_DIR = BASE_DIR / "resources" / "ocr_results"
PDF_PLAN_DIR = BASE_DIR / "resources" / "pdf_waste_collection_plans"
WASTE_JSON_DIR = BASE_DIR / "resources" / "waste_collection_api_data"
STREET_ZONES_DIR = BASE_DIR / "resources" / "street_zones_mapping"
DOWNLOAD_LINKS_DIR = BASE_DIR / "resources" / "download_links"
