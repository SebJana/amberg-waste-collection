from fastapi import FastAPI, Path, Depends, HTTPException
from datetime import datetime, date
import re
import json

from src.app.exceptions import ZoneNotFoundError
from src.config import WASTE_JSON_DIR

YEAR = 2025
API_DATA_FILE_NAME = f"waste-collection-{YEAR}.json"
CACHED_NEXT_PICKUPS = {}

app = FastAPI()


def validate_zone_code(zone_code: str = Path(...)) -> str:
    # Validate zone code is in that range and only has two characters
    pattern = r'^[A-E][1-4]$'

    clean_code = zone_code.strip()
    if not re.match(pattern, clean_code):
        raise HTTPException(status_code=400, detail="Invalid zone code")
    return clean_code

def extract_zone_identifiers(zone_code: str = Depends(validate_zone_code)):
    # Extract zone code (A4) into zone identifiers letter (A) and number (4) for lookup in the schedule data
    zone_letter = zone_code[0]
    zone_number = zone_code[1]

    return zone_letter, zone_number

@app.get("/")
def ping():
    return {"message" : "Hello from the Waste Collection Amberg API"}

@app.get("/api/waste-collection/{zone_code}/next")
def next_pickups(zone_code: str = Depends(validate_zone_code)):
    try:
        zone_data = load_zone_data(zone_code)
        return get_next_pickups(zone_code, zone_data)
    except ZoneNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise  # re-raise so the correct status is preserved
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")
    

# Open the schedule data file and try to extract data corresponding to the zone code
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

# Check if there is a valid result in cache and if not determine and cache it
def get_next_pickups(zone_code: str, zone_data: dict):
    today = date.today()

    # Check cache is not empty
    if CACHED_NEXT_PICKUPS != {}:
        # Check if zone_code is in cache
        if zone_code in CACHED_NEXT_PICKUPS:
            # Check if reference date is today
            cached_date_str = CACHED_NEXT_PICKUPS[zone_code]["reference_date"]
            cached_date = datetime.fromisoformat(cached_date_str).date()
            if today == cached_date:
                return CACHED_NEXT_PICKUPS[zone_code]

    # If there is no valid result in cache determine the next pickup dates
    return determine_next_pickups(zone_code, zone_data, today)

def determine_next_pickups(zone_code: str, zone_data: dict, today: date):
    global CACHED_NEXT_PICKUPS
    next_pickups_response = {}

    # Set zone and date 
    next_pickups_response['zone'] = zone_code
    next_pickups_response['reference_date'] = today.isoformat()

    # Init the next pickups dictionary
    next_pickups = {
        "Restmüll": "",
        "Biomüll": "",
        "Papiermüll": "",
        "Gelber Sack": ""
    }

    # Sort pickup data by dates even though its pre-sorted after the extraction process
    # It's crucial for the proper determination of the next pickup dates
    sorted_zone_data = dict(sorted(zone_data.items()))

    # Find next pickup dates for each waste type
    for date_str, waste_types in sorted_zone_data.items():
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        # Only dates later than or equal to today can be future pickup dates
        if date_obj < today: 
            continue # Skip over dates in the past
        # Look at each waste type that gets collected on the current date
        for waste_type in waste_types:
            # Check if the next pickup slot is empty and if so set it to the current date
            if next_pickups.get(waste_type) == "":
                next_pickups[waste_type] = date_str
        # Check if all next pickup dates for every type of waste have already been set
        if all(value != "" for value in next_pickups.values()):
            break # Search is over

    # Convert the pickup dates to the API response format
    # If the date for the type is still "" means there is no pickup date in the dataset 
    next_pickups_api = []
    for waste_type, date_str in next_pickups.items():
        next_pickups_api.append({"type": waste_type ,"date": date_str})

    # Set the resulting list as next_pickups in the api response
    next_pickups_response['next_pickups'] = next_pickups_api

    # Cache and return the full result
    CACHED_NEXT_PICKUPS[zone_code] = next_pickups_response
    return next_pickups_response
    


