from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
OCR_RESULTS_DIR = BASE_DIR / "resources" / "ocr_results"
PDF_PLAN_DIR = BASE_DIR / "resources" / "pdf_waste_collection_plans"
WASTE_JSON_DIR = BASE_DIR / "resources" / "waste_collection_api_data"
STREET_ZONES_DIR = BASE_DIR / "resources" / "street_zones_mapping"
