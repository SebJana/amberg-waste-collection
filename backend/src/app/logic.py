from datetime import datetime, date

# Cache the next pick up dates for each zone as they
# only change, at most, once per day
CACHED_NEXT_PICKUPS = {}

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