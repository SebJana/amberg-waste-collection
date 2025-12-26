import pandas as pd
from datetime import date
import holidays
import ast
import json

import sys
from pathlib import Path

# Add the parent directory to sys.path to import config
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import config

OCR_RESULTS_DIR = config.OCR_RESULTS_DIR
WASTE_JSON_DIR = config.WASTE_JSON_DIR

# Letter zone has to be in this list
VALID_LETTER_ZONES = ['a', 'b', 'c', 'd', 'e']

# Number zone has to be in this list
VALID_NUMBERS = ['1', '2', '3', '4']
VALID_NUMBER_ZONES = ['1', '2', '3', '4', '1/2', '2/3', '3/4']


def load_and_merge_ocr_csv(year):
    """
    Load and merge OCR extraction results from all CSV files for the given year.

    Args:
        year (int): The year for which to load the data.

    Returns:
        pd.DataFrame: Merged DataFrame containing all OCR extraction results.
    """
    # Load in the OCR extraction results
    # Find all CSV files that have the given year in their name
    csv_files = [f for f in OCR_RESULTS_DIR.glob("*.csv") if str(year) in f.name]
    csv_files.sort()  # Ensure consistent order
    
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found for year {year} in {OCR_RESULTS_DIR}")
    
    # Read and concatenate all CSV files
    dfs = [pd.read_csv(f) for f in csv_files]
    return pd.concat(dfs, ignore_index=True)


def get_bavarian_holidays(year):
    """
    Get all holidays in Bavaria for a given year, including custom ones.

    Args:
        year (int): The year to get holidays for.

    Returns:
        holidays.Germany: Holiday object containing all Bavarian holidays.
    """
    # Get holidays in Bavaria for a given year
    bavarian_holidays = holidays.Germany(state='BY', years=year)
    # Manually add Mariä Himmelfahrt (Not a Bavaria-wide holiday, therefore not included in 'holidays')
    bavarian_holidays[date(year, 8, 15)] = "Assumption Day"
    return bavarian_holidays


def filter_placeholder_days(df, year):
    """
    Filter out placeholder days that don't exist and add date columns.

    Removes entries with empty text and creates a proper Date column.

    Args:
        df (pd.DataFrame): Input DataFrame with OCR data.
        year (int): The year for date creation.

    Returns:
        pd.DataFrame: Filtered DataFrame with Date column added.
    """
    # Filter out placeholder days that don't exist
    df = df[df['Text'].astype(str) != '[]'].copy()

    # Create a date for each entry
    df['Date'] = pd.to_datetime(df['Day'].astype(str) + ' ' + df['Month'] + ' ' + str(year))
    df['Date'] = pd.to_datetime(df['Date']).dt.date
    return df


def drop_holidays(df, holidays):
    """
    Mark and remove holiday dates from the DataFrame.

    Waste collection doesn't occur on holidays.

    Args:
        df (pd.DataFrame): Input DataFrame with Date column.
        holidays (holidays.Germany): Holiday object to check against.

    Returns:
        pd.DataFrame: DataFrame with holidays removed and Holiday? column added.
    """
    # Determine if day is a holiday (no garbage pick-up on them)
    df['Holiday?'] = df['Date'].apply(lambda d: d in holidays)
    # Drop the holiday dates
    return df[df['Holiday?'] != True]


def extract_pickups(df):
    """
    Extract pickup zones from OCR text and validate completeness.

    Parses the Text column to extract waste pickup information, ensuring
    each valid day has exactly 5 pickup zones.

    Args:
        df (pd.DataFrame): Input DataFrame with Text column.

    Returns:
        pd.DataFrame: DataFrame with pickups and pickups_count columns.

    Raises:
        AssertionError: If any pickup list doesn't have exactly 5 elements.
    """
    # Extract the pickup zones from the OCR text
    # ['2', 'Do', 'C', '1/2', '1/2', '3', '4] -> ['C', '1/2', '1/2', '3', '4]
    df['pickups'] = df['Text'].apply(
        lambda x: ast.literal_eval(x)[2:] if isinstance(x, str) else []
    )

    # Count the number of elements in the pickups list
    df['pickups_count'] = df['pickups'].apply(len)

    # Drop the non-pickup weekends 
    df = df[df['pickups_count'] > 1]

    # Every pickup list for each day has to have 5 elements now
    # If not throw error and print the violating row(s)
    violating_rows = df[df['pickups_count'] != 5]
    if not violating_rows.empty:
        print("❌ Invalid pickup lists (count ≠ 5):")
        print(violating_rows)
        assert False, "Not all pickup lists are complete, correct the error in the OCR result"

    return df


def validate_letter_zones(df):
    """
    Extract and validate letter zones from pickup data.

    The first element of each pickup list should be a valid letter zone (A-E).

    Args:
        df (pd.DataFrame): Input DataFrame with pickups column.

    Returns:
        pd.DataFrame: DataFrame with letter_zone column added.

    Raises:
        AssertionError: If any letter zone is invalid.
    """
    # Extract first pickup zone and normalize to lowercase
    df['letter_zone'] = df['pickups'].apply(lambda x: x[0].lower() if x else None)

    # Check if any zone is not valid
    invalid_zones = df[~df['letter_zone'].isin(VALID_LETTER_ZONES)]

    if not invalid_zones.empty:
        print("❌ Invalid pickup letter zones found:")
        print(invalid_zones[['Date', 'letter_zone', 'pickups']])
        assert False, "Some pickup letter zones are not valid"

    # Optional: capitalize again for presentation
    df['letter_zone'] = df['letter_zone'].str.upper()
    return df


def extract_and_validate_number_zones(df):
    """
    Extract and validate number zones for each waste type.

    Pickup Scheme Explanation:
    Letter Zone, General waste, Organic waste, Paper waste, Packaging waste
    Buchstabe, Restmüll, Biomüll, Papiermüll, Gelber Sack

    Args:
        df (pd.DataFrame): Input DataFrame with pickups column.

    Returns:
        pd.DataFrame: DataFrame with waste type columns added.

    Raises:
        AssertionError: If any number zone is invalid.
    """
    # Extract and assign
    df['Restmüll']     = df['pickups'].apply(lambda x: x[1] if len(x) >= 5 else None)
    df['Biomüll']      = df['pickups'].apply(lambda x: x[2] if len(x) >= 5 else None)
    df['Papiermüll']   = df['pickups'].apply(lambda x: x[3] if len(x) >= 5 else None)
    df['Gelber Sack']  = df['pickups'].apply(lambda x: x[4] if len(x) >= 5 else None)

    # Validate each column individually
    invalid_rows = df[
        ~df['Restmüll'].isin(VALID_NUMBER_ZONES) |
        ~df['Biomüll'].isin(VALID_NUMBER_ZONES) |
        ~df['Papiermüll'].isin(VALID_NUMBER_ZONES) |
        ~df['Gelber Sack'].isin(VALID_NUMBER_ZONES)
    ]

    # Handle invalid cases
    if not invalid_rows.empty:
        print("❌ Invalid number zones found:")
        print(invalid_rows[['Date', 'letter_zone', 'Restmüll', 'Biomüll', 'Papiermüll', 'Gelber Sack']])
        assert False, "At least one value is not a valid number zone"

    return df


def drop_unused_columns(df):
    """
    Remove temporary and helper columns from the DataFrame.

    Args:
        df (pd.DataFrame): Input DataFrame with all columns.

    Returns:
        pd.DataFrame: Cleaned DataFrame with only essential columns.
    """
    # Drop temporary/helper columns
    return df.drop(['Month', 'Day', 'Text', 'Holiday?', 'pickups', 'pickups_count'], axis=1)

def find_columns_with_number(row, number):
    """
    Find which waste type columns contain a specific number zone.

    Args:
        row (pd.Series): A row from the DataFrame.
        number (str): The number zone to search for.

    Returns:
        list: List of waste type column names that contain the number.
    """
    waste_types = ['Restmüll', 'Biomüll', 'Papiermüll', 'Gelber Sack']
    matches = []

    for col in waste_types:
        val = str(row[col])
        if number in val:
            matches.append(col)

    return matches

def format_results_json(df):
    """
    Format the DataFrame into a nested JSON structure for the API.

    Creates a dictionary with letter zones as top-level keys, then number zones,
    then dates with their corresponding waste types.

    Args:
        df (pd.DataFrame): Cleaned DataFrame with waste collection data.

    Returns:
        dict: Nested dictionary structure for JSON export.
    """
    waste_collection = {}

    # Loop through all letter zones
    for letter in VALID_LETTER_ZONES:
        letter_zone = letter.upper()
        df_zone = df[df['letter_zone'] == letter_zone]

        waste_collection[letter_zone] = {n: {} for n in VALID_NUMBERS}

        # Loop through all number zones
        for number in VALID_NUMBERS:
            # Loop through all rows of the letter zone DataFrame
            for _, row in df_zone.iterrows():
                # Check in which waste type column(s) the number zone appears
                cols = find_columns_with_number(row, number)
                if cols:
                    date_str = row['Date'].isoformat()
                    # Save that date:[waste types] entry to the dict
                    waste_collection[letter_zone][number][date_str] = cols

    return waste_collection

def export_result(result, year):
    """
    Export the formatted results to a JSON file.

    Args:
        result (dict): The formatted waste collection data.
        year (int): The year for the filename.
    """
    output_path = WASTE_JSON_DIR / f"waste-collection-{year}.json"
    with open(output_path, "w", encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)


def run_collection_data_preparation(year):
    """
    Run the complete data preparation pipeline.

    Loads OCR data, filters and validates it, and exports to JSON.

    Args:
        year (int): The year to process.
    """
    df = load_and_merge_ocr_csv(year)
    bavarian_holidays = get_bavarian_holidays(year)
    df = filter_placeholder_days(df, year)
    df = drop_holidays(df, bavarian_holidays)
    df = extract_pickups(df)
    df = validate_letter_zones(df)
    df = extract_and_validate_number_zones(df)
    df = drop_unused_columns(df)
    result = format_results_json(df)

    # export_result(result, year)