from fastapi import Depends, Path, HTTPException
import re

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

def sort_zone_code_schedule(zone_data):
    return dict(sorted(zone_data.items()))
