import sys
import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional

import osmnx as ox
from shapely.geometry import LineString, MultiLineString

# rapidfuzz for fuzzy matching
from rapidfuzz import fuzz, process

# Add the parent directory to sys.path to import project config
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from config import STREET_ZONES_DIR


STREET_ZONES_FILE = Path(STREET_ZONES_DIR) / "street-zones-mapping.json"
OUTPUT_JSON_FILE = Path(STREET_ZONES_DIR) / "amberg_streets.json"
AMBERG = "Amberg, Germany"


def load_street_zones(path: Path) -> Dict[str, str]:
    """Load and normalize the street-zone mapping from a JSON file.

    Args:
        path: Path to the JSON file containing a mapping of street name -> zone.

    Returns:
        A dictionary mapping normalized street name to zone code.
    """
    with open(path, encoding="utf-8") as fh:
        raw = json.load(fh)
    return normalize_mapping(raw)


def normalize_mapping(raw: Dict[str, str]) -> Dict[str, str]:
    """Normalize raw mapping keys to a consistent form.

    Performs lightweight normalization such as expanding common abbreviations
    and trimming parts after house number separators (e.g. 'Nr.').

    Args:
        raw: Raw mapping from file.

    Returns:
        Normalized mapping.
    """
    mapping: Dict[str, str] = {}
    for k, v in raw.items():
        key = k.replace("Str.", "Straße").strip()
        key_norm = key.split("Nr.")[0].strip()
        mapping[key_norm] = v
    return mapping


def get_zone_fuzzy(
    name: str, mapping: Dict[str, str], threshold: int = 75
) -> Optional[str]:
    """Return the best-matching zone for a street name using fuzzy matching.

    Args:
        name: Street name to match.
        mapping: Dictionary of normalized street names to zones.
        threshold: Minimum fuzzy match score (0-100) to accept a match.

    Returns:
        The matched zone string, or ``None`` if not found or below threshold.
    """
    if not name or name == "unknown":
        return None

    best = process.extractOne(name, mapping.keys(), scorer=fuzz.ratio)
    if best and best[1] >= threshold:
        return mapping[best[0]]
    return None


def fetch_edges_for_city(city: str = AMBERG) -> Any:
    """Download the driving/service graph for a city and convert to edges GeoDataFrame.

    Args:
        city: Place name understood by OSMnx.

    Returns:
        A GeoDataFrame of graph edges.
    """
    G = ox.graph_from_place(city, network_type="drive_service", retain_all=True)
    gdf_edges = ox.graph_to_gdfs(G, nodes=False, edges=True)
    return gdf_edges


def normalize_street_name(name: Any) -> str:
    """Normalize a street name from OSM data.

    Args:
        name: Raw street name from OSM.

    Returns:
        Normalized street name string.
    """
    if name is None or (isinstance(name, float) and math.isnan(name)):
        return "unknown"
    if isinstance(name, list):
        return name[0]
    return name


def extract_segments_from_geometry(geom: Any) -> List[LineString]:
    """Extract LineString segments from a geometry object.

    Args:
        geom: Geometry object (LineString or MultiLineString).

    Returns:
        List of LineString segments.
    """
    segments: List[LineString] = []
    if isinstance(geom, LineString):
        segments.append(geom)
    elif isinstance(geom, MultiLineString):
        segments.extend(list(geom))
    return segments


def extract_streets_data(
    gdf_edges: Any, mapping: Dict[str, str]
) -> List[Dict[str, Any]]:
    """Extract street segments with their inferred zones from edges GeoDataFrame.

    Args:
        gdf_edges: GeoDataFrame of edges from OSMnx.
        mapping: Normalized street name -> zone mapping.

    Returns:
        A list of street segment dicts: {"name", "coords", "zone"}.
    """
    streets_data: List[Dict[str, Any]] = []

    for _, row in gdf_edges.iterrows():
        geom = row.get("geometry")
        name = normalize_street_name(row.get("name"))
        zone = get_zone_fuzzy(name, mapping) or (
            "unknown" if name == "unknown" else None
        )

        segments = extract_segments_from_geometry(geom)
        for seg in segments:
            coords = [(lat, lon) for lon, lat in seg.coords]
            streets_data.append(
                {"name": name, "coords": coords, "zone": zone or "unknown"}
            )

    return streets_data


def filter_streets_data(streets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Filter out streets without a usable zone (e.g. 'unknown').

    Args:
        streets: List of street dictionaries.

    Returns:
        Filtered list containing only streets with a known zone.
    """
    return [
        s for s in streets if s.get("zone") is not None and s.get("zone") != "unknown"
    ]


def write_json(path: Path, data: List[Dict[str, Any]]) -> None:
    """Write the given data as pretty JSON to path.

    Args:
        path: Output file path.
        data: List of dicts to serialize.
    """
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)


def run_streets_coordinates(city: str = AMBERG) -> None:
    """Main entry point: build street segments with zones and write JSON.

    Args:
        city: City/place string for OSMnx to download the graph for.
    """
    print(f"Loading street-zone mapping from {STREET_ZONES_FILE}")
    mapping = load_street_zones(STREET_ZONES_FILE)

    print(f"Fetching street graph for '{city}'")
    gdf_edges = fetch_edges_for_city(city)

    print("Extracting street segments and matching zones...")
    streets = extract_streets_data(gdf_edges, mapping)

    filtered = filter_streets_data(streets)

    write_json(OUTPUT_JSON_FILE, filtered)
    print(f"Exported {len(filtered)} streets with zones to {OUTPUT_JSON_FILE}")


if __name__ == "__main__":
    run_streets_coordinates()
