import requests
from datetime import date
import time
from enum import Enum
import json
import sys
from pathlib import Path

# Add the parent directory to sys.path to import config
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import config

DOWNLOAD_LINKS_DIR = config.DOWNLOAD_LINKS_DIR


class ResultTypes(Enum):
    LISTS = "Listen"
    CALENDER = "Kalender"


CHECK_AVAILABILITY_INTERVAL = 3 * 60 * 60  # 3 hours
REQUEST_SLEEP_INTERVAL = 5  # 5 seconds

# Stadt Amberg waste collection schedules are hosted at this location
# Source: https://www.amberg.de/ (Abfallberatung/Abfuhrkalender)
API_BASE_URL = "https://amberg.de/fileadmin/Abfallberatung/Abfuhrkalender/{year}/{result_type}/{zone}.pdf"


def check_valid_pdf_url(url: str):
    """
    Verify that a URL points to a valid PDF file.

    Makes a HEAD request to the URL and checks the Content-Type header
    to confirm it's a PDF file.

    Args:
        url (str): The URL to check.

    Returns:
        bool: True if the URL returns a 200 status and Content-Type is PDF,
              False otherwise.
    """
    try:
        resp = requests.head(url, allow_redirects=True, timeout=10)

        if resp.status_code == 200:
            content_type = resp.headers.get("Content-Type", "")
            if "application/pdf" in content_type:
                print(f"{url} exists and looks like a PDF file.")
                return True
            else:
                print(
                    "URL exists but doesn't look like PDF "
                    f"(Content-Type: {content_type})"
                )
                return False
        else:
            print("URL returned status:", resp.status_code)
            return False

    except requests.RequestException as e:
        print("Error:", e)
        return False


def save_availability_state(availability_map: dict[int, dict[str, bool]]):
    """
    Save the PDF availability state to a JSON file.

    Creates a structured JSON file containing the availability status for all
    waste collection document types and years, along with URL template metadata.

    Args:
        availability_map (dict[int, dict[str, bool]]): Nested dictionary mapping
            year -> result_type -> availability status.
            Example: {2025: {"Listen": True, "Kalender": False}}
    """
    result_types = [rt.value for rt in ResultTypes]

    state = {
        "reference_date": date.today().isoformat(),
        "result_types": result_types,
        "url_template": {
            "template": API_BASE_URL,
            "parameters": {
                "year": {"type": "integer", "example": date.today().year},
                "result_type": {"type": "string", "example": "Listen"},
                "zone": {"type": "string", "example": "E3"},
            },
        },
        "availability": availability_map,
    }

    file_path = Path(DOWNLOAD_LINKS_DIR) / "availability_state.json"
    with open(file_path, "w", encoding="utf-8") as fh:
        print("Successfully saved current state to file")
        json.dump(state, fh, ensure_ascii=False, indent=2)


def run_download_paths_check():
    """
    Periodically check availability of waste collection PDF documents.

    Runs an infinite loop that checks the availability of waste collection
    documents for the last year, current year, and next year across all result
    types. Results are persisted to a JSON file and the loop sleeps between
    checks based on CHECK_AVAILABILITY_INTERVAL.

    Note:
        Assumes that if one zone code exists, all files for that year/result
        type combination exist for all zone codes.
    """
    # Uses zone A1 as a proxy to determine availability for all zones
    # (assumes all zone files are published together, so checking one zone confirms all exist)
    while True:
        # Determine current year
        current_year = date.today().year
        example_zone = "A1"
        # Type: year -> result_type_value -> availability
        availability_map: dict[int, dict[str, bool]] = {}
        # Loop over last year, current year and next year
        for year in range(current_year - 1, current_year + 2):
            # Initialize year entry if it doesn't exist
            availability_map.setdefault(year, {})
            # Loop over all possible types of downloads
            for result_type in ResultTypes:
                # Init this variation as not available
                availability_map[year][result_type.value] = False
                # Use the current result type value and year
                # and an example zone to poll the url
                url = (
                    API_BASE_URL.replace("{year}", str(year))
                    .replace("{result_type}", result_type.value)
                    .replace("{zone}", example_zone)
                )
                if check_valid_pdf_url(url):
                    # Update availability to True if url is reachable
                    availability_map[year][result_type.value] = True
                # Delay between requests
                time.sleep(REQUEST_SLEEP_INTERVAL)
        save_availability_state(availability_map)
        # Idle after checking all variations
        time.sleep(CHECK_AVAILABILITY_INTERVAL)


if __name__ == "__main__":
    print("Started")
    run_download_paths_check()
