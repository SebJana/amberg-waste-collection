import json
from fastapi import HTTPException
from pathlib import Path

from .exceptions import ZoneNotFoundError
from .utils import extract_zone_identifiers
from ..config import WASTE_JSON_DIR

def load_all_waste_data():
    """Load and merge data from all JSON files in WASTE_JSON_DIR."""
    merged_data = {}
    json_files = list(WASTE_JSON_DIR.glob("*.json"))
    
    if not json_files:
        raise HTTPException(status_code=500, detail="No waste collection schedule data files found")
    
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as file:
                data = json.load(file)
                for zone_letter, zones in data.items():
                    # Initialize the zone letter in merged_data if not present
                    if zone_letter not in merged_data:
                        merged_data[zone_letter] = {}
                    for zone_number, zone_data in zones.items():
                        # Initialize the zone number under this letter if not present
                        if zone_number not in merged_data[zone_letter]:
                            merged_data[zone_letter][zone_number] = {}
                        # Merge the waste collection dates and types for this zone
                        merged_data[zone_letter][zone_number].update(zone_data)
        except FileNotFoundError:
            raise HTTPException(status_code=500, detail=f"Waste collection schedule data file {json_file.name} not found")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"Waste collection schedule data file {json_file.name} is corrupted")
    
    return merged_data

def load_zone_data(zone_code: str):
    data = load_all_waste_data()
    
    zone_letter, zone_number = extract_zone_identifiers(zone_code)

    if zone_letter not in data or zone_number not in data[zone_letter]:
        raise ZoneNotFoundError(f"Zone '{zone_code}' not found in waste collection data")
    
    # Return the waste collection dates and types for the corresponding zone code
    return data[zone_letter][zone_number]