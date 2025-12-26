import json
from fastapi import HTTPException

from .exceptions import ZoneNotFoundError
from .utils import extract_zone_identifiers
from ..config import WASTE_JSON_DIR

YEAR = 2025
API_DATA_FILE_NAME = f"waste-collection-{YEAR}.json"

def load_zone_data(zone_code: str):
    data_path = WASTE_JSON_DIR / API_DATA_FILE_NAME

    try:
        with open(data_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Waste collection schedule data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Waste collection schedule data file is corrupted")
    
    zone_letter, zone_number = extract_zone_identifiers(zone_code)

    if zone_letter not in data or zone_number not in data[zone_letter]:
        raise ZoneNotFoundError(f"Zone '{zone_code}' not found in waste collection data")
    
    # Return the waste collection dates and types for the corresponding zone code
    return data[zone_letter][zone_number]