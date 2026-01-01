from fastapi import APIRouter, Depends, HTTPException
from .utils import validate_zone_code
from .file_io import (
    load_zone_data,
    load_street_zone_mapping,
    load_street_coords_mapping,
    load_download_links_availability,
)
from .logic import get_next_pickups, get_future_pickups
from .exceptions import ZoneNotFoundError

router = APIRouter()


@router.get(
    "/api/waste-collection/{zone_code}/next",
    summary="Get next pickups for a zone",
    description="Returns the next upcoming waste collection(s) for the given zone code.",
    tags=["Waste Collection"],
    responses={
        200: {"description": "Next pickups returned successfully."},
        400: {"description": "Invalid zone code (validation failed)."},
        404: {"description": "Zone not found."},
        500: {
            "description": "Server error (e.g. missing or corrupted waste data files)."
        },
    },
)
async def next_pickups(zone_code: str = Depends(validate_zone_code)):
    """Returns the next pickup(s) for the provided `zone_code`.

    The `zone_code` is validated via a dependency. On success this
    returns a JSON structure describing the upcoming pickup dates and types.
    The response includes a `reference_date` field which is given in UTC
    in `YYYY-MM-DD` format.
    """
    try:
        zone_data = load_zone_data(zone_code)
        return get_next_pickups(zone_code, zone_data)
    except ZoneNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")


@router.get(
    "/api/waste-collection/{zone_code}/schedule",
    summary="Get future schedule for a zone",
    description="Returns the upcoming waste collection schedule for the given zone code.",
    tags=["Waste Collection"],
    responses={
        200: {"description": "Schedule returned successfully."},
        400: {"description": "Invalid zone code (validation failed)."},
        404: {"description": "Zone not found."},
        500: {
            "description": "Server error (e.g. missing or corrupted waste data files)."
        },
    },
)
async def future_schedule(zone_code: str = Depends(validate_zone_code)):
    """Returns the future schedule for the provided `zone_code`.

    The response contains upcoming pickup dates for the next several weeks/months.
    The response includes a `reference_date` field which is given in UTC
    in `YYYY-MM-DD` format.
    """
    try:
        zone_data = load_zone_data(zone_code)
        return get_future_pickups(zone_code, zone_data)
    except ZoneNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")


# Don't offer a "(partial)street_name" route that returns possible candidates and their zone codes
# but send all street mapping entries to the client and let them do the search/filter
# NOTE: Works because Amberg only has a few hundred streets and saves server workload
@router.get(
    "/api/waste-collection/street-zone-mapping",
    summary="Get street → zone mapping",
    description=(
        "Returns a mapping of street names to their waste collection zone codes. "
        "The client is expected to filter/search locally."
    ),
    tags=["Mapping"],
    responses={
        200: {"description": "Mapping returned successfully."},
        500: {"description": "Server error (mapping file missing or corrupted)."},
    },
)
async def street_zone_mapping():
    """Return the street to zone mapping for all streets in Amberg."""
    try:
        return load_street_zone_mapping()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")


# Returns mapping of street name + garbage collection zone + geo-coordinates
@router.get(
    "/api/waste-collection/street-coordinates-mapping",
    summary="Get street → zone → coordinates mapping",
    description=(
        "Returns a full mapping of street names to zone codes and geo-coordinates. "
        "Useful for rendering maps on the client side."
    ),
    tags=["Mapping"],
    responses={
        200: {"description": "Coordinates mapping returned successfully."},
        500: {
            "description": "Server error (coordinates mapping file missing or corrupted)."
        },
    },
)
async def street_coordinates_mapping():
    """Return a mapping of streets, their zone codes, and geo-coordinates."""
    try:
        return load_street_coords_mapping()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")


@router.get(
    "/api/waste-collection/download-links-availability",
    summary="Get download links availability state",
    description="Returns the current availability state of downloadable resources.",
    tags=["Download Links"],
    responses={
        200: {"description": "Availability state returned successfully."},
        500: {
            "description": "Server error (availability state file missing or corrupted)."
        },
    },
)
async def download_links_availability():
    """Return the download links availability state."""
    try:
        return load_download_links_availability()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")
