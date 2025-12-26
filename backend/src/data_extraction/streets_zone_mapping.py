import pdfplumber
import re
import json
from pathlib import Path
import sys

# Add the parent directory to sys.path for imports
sys.path.insert(0, str(Path(__file__).parents[1]))

from config import STREET_ZONES_DIR

def get_zone_pattern():
    """Return the compiled regex pattern for matching zone codes (e.g., A1, B 2)."""
    return re.compile(r'([A-E])\s?(\d)')

def process_single_line(line, pattern):
    """Process a single line of text from the PDF, extracting and cleaning street-zone parts.

    Args:
        line (str): The line of text to process.
        pattern: The compiled regex pattern for zone codes.

    Returns:
        list: List of cleaned street-zone strings.
    """
    # Strip line and remove document page headers
    if not line.strip() or line.strip() == "Straßenverzeichnis  und  Abfuhrgebiete   (AG)":
        return []
    # Find zone code in lines
    line_fixed = pattern.sub(r'\1\2', line.strip())
    # Split the line after every found zone
    split_lines = re.split(r'(?<=[A-E]\d)\s', line_fixed)
    parts = []
    for part in split_lines:
        if part.strip():
            # Append stripped and replace '"' characters that occur in the 'impressum'
            parts.append(part.strip().replace('"', ""))
    return parts

def extract_lines(pdf_path):
    """Extract and process lines from the PDF containing street and zone information.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        list: List of processed street-zone strings.
    """
    lines = []
    pattern = get_zone_pattern()
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text(layout=True)
            if text:
                for line in text.split('\n'):
                    lines.extend(process_single_line(line, pattern))
    return lines

def is_zone_code(s):
    """Check if the string is a valid zone code (e.g., A1, B2).

    Args:
        s (str): The string to check.

    Returns:
        bool: True if it's a valid zone code, False otherwise.
    """
    return re.match(r'[A-E]\d$', s.strip())

def clean_street_name(street):
    """Clean and standardize the street name.

    Args:
        street (str): The raw street name.

    Returns:
        str: The cleaned street name with 'str.' replaced by 'straße'.
    """
    return street.strip().replace("str.", "straße")

def build_street_zone_map(lines):
    """Build a dictionary mapping street names to zone codes from the processed lines.

    Args:
        lines (list): List of street-zone strings.

    Returns:
        dict: Dictionary with street names as keys and zone codes as values.
    """
    street_zone_map = {}
    for line in lines:
        parts = line.rsplit(" ", 1)
        # Only use rows that have street and zone code part and end in zone code
        if len(parts) == 2 and is_zone_code(parts[1]):
            street = clean_street_name(parts[0])
            street_zone_map[street] = parts[1]
    return street_zone_map

def save_to_json(data, filename):
    """Save the data to a JSON file.

    Args:
        data: The data to save (dict or list).
        filename (str): The output filename.
    """
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def run_streets_zone_mapping():
    """Main function to run the street extraction and processing pipeline."""
    pdf_path = STREET_ZONES_DIR / "street-directory.pdf"
    lines = extract_lines(pdf_path)
    street_zone_map = build_street_zone_map(lines)
    save_to_json(street_zone_map, STREET_ZONES_DIR / "street-zones-mapping.json")

if __name__ == "__main__":
    run_streets_zone_mapping()
