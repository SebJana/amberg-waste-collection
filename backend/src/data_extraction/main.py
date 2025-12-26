from planner_extraction import run_extraction
from data_preparation import run_data_preparation

# Set this to the corresponding year for proper file names and correct extraction
YEAR = 2026

if __name__ == "__main__":
    # IMPORTANT: 
    # Set the box coordinates for the pdfs
    # Scheme: (top_left_x, top_left_y, bottom_right_x, bottom_left_y)
    # Set top left corner BELOW the month tiles, right next to the first month column start
    # Fit the box coordinates SNUGLY around all 6 month columns
    
    # Jan - Jun
    run_extraction(
        pdf_name=f"Abfuhrplan_Januar_bis_Juni_{YEAR}.pdf",
        box_coords=(105, 305, 3400, 2250),
        csv_name=f"waste-collection-01_06_{YEAR}.csv",
        months=["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    )

    # Jul - Dec
    run_extraction(
        pdf_name=f"Abfuhrplan_Juli_bis_Dezember_{YEAR}.pdf",
        box_coords=(105, 305, 3400, 2256),
        csv_name=f"waste-collection-07_12_{YEAR}.csv",
        months=["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    )

    # Comment it out if you only want to extract the data to CSV and not create the JSON the API uses)
    run_data_preparation(year=YEAR)

