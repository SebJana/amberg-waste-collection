from fastapi import APIRouter, Depends, HTTPException
from src.app.utils import validate_zone_code
from src.app.file_io import load_zone_data
from src.app.logic import get_next_pickups
from src.app.exceptions import ZoneNotFoundError

router = APIRouter()

@router.get("/api/waste-collection/{zone_code}/next")
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