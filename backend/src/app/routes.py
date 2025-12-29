from fastapi import APIRouter, Depends, HTTPException
from .utils import validate_zone_code
from .file_io import (
    load_zone_data,
    load_street_zone_mapping,
    load_street_coords_mapping,
)
from .logic import get_next_pickups, get_future_pickups
from .exceptions import ZoneNotFoundError

router = APIRouter()


@router.get("/api/waste-collection/{zone_code}/next")
async def next_pickups(zone_code: str = Depends(validate_zone_code)):
    try:
        zone_data = load_zone_data(zone_code)
        return get_next_pickups(zone_code, zone_data)
    except ZoneNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise  # re-raise so the correct status is preserved
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")


@router.get("/api/waste-collection/{zone_code}/schedule")
async def future_schedule(zone_code: str = Depends(validate_zone_code)):
    try:
        zone_data = load_zone_data(zone_code)
        return get_future_pickups(zone_code, zone_data)
    except ZoneNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except HTTPException:
        raise  # re-raise so the correct status is preserved
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")


# Don't offer a "(partial)street_name" route that returns possible candidates and their zone codes
# but send all street mapping entries to the client and let them do the search/filter
# NOTE: Works because Amberg only has a few hundred streets and saves server workload
@router.get("/api/waste-collection/street-zone-mapping")
async def street_zone_mapping():
    try:
        return load_street_zone_mapping()
    except HTTPException:
        raise  # re-raise so the correct status is preserved
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")


# TODO refactor to return zone based street coordinates to decrease payload data
# Returns mapping of street name + garbage collection zone + geo-coordinates
@router.get("/api/waste-collection/street-coordinates-mapping")
async def street_coordinates_mapping():
    try:
        return load_street_coords_mapping()
    except HTTPException:
        raise  # re-raise so the correct status is preserved
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")
