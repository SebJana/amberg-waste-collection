from src.data_extraction.planner_extraction import run_extraction
from src.data_extraction.data_preparation import run_data_preparation

# Set this to the corresponding year for proper file names and correct extraction
YEAR = 2025

if __name__ == "__main__":
    # IMPORTANT: 
    # Set the box coordinates for the pdfs
    # Scheme: (top_left_x, top_left_y, bottom_right_x, bottom_left_y)
    # Set top left corner BELOW the month tiles, right next to the first month column start
    # Fit the box coordinates SNUGLY around all 6 month columns

    # Jan - Jun
    run_extraction(
        pdf_name="Abfuhrplan_Januar_bis_Juni.pdf",
        box_coords=(135, 320, 3375, 2255),
        csv_name=f"waste-collection-01_06_{YEAR}.csv",
        months=["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    )

    # Jul - Dec
    run_extraction(
        pdf_name="Abfuhrplan_Juli_bis_Dezember.pdf",
        box_coords=(122, 320, 3385, 2258),
        csv_name=f"waste-collection-07_12_{YEAR}.csv",
        months=["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    )

    # Uncomment the line below to run full data preparation
    # (comment it out if you only want to extract the data to CSV and not create the JSON the API uses)
    run_data_preparation(year=YEAR)
