import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import React, { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";
import { getStreetCoordinatesMapping } from "../../api/wasteAPI";
import type { StreetWithCoordinates } from "../../types/streetZones";

// Tracks map zoom changes and updates polyline weight dynamically
const ZoomHandler = ({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) => {
  const map = useMap();

  React.useEffect(() => {
    // Callback to trigger parent zoom state update
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    // Listen to zoom end events and call callback on initial mount
    map.on("zoomend", handleZoom);
    onZoomChange(map.getZoom());

    // Cleanup: remove zoom listener on unmount
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
};

const HomeControl = ({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) => {
  const map = useMap();

  // Add Leaflet home button control to reset map view
  React.useEffect(() => {
    const HomeButton = L.Control.extend({
      options: {
        position: "bottomleft",
      },

      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control"
        );
        const button = L.DomUtil.create("a", "home-button", container);
        button.href = "#";
        button.title = "Center map";
        button.textContent = "⌂";

        L.DomEvent.on(button, "click", (e: Event) => {
          L.DomEvent.preventDefault(e);
          map.setView(center, zoom);
        });

        return container;
      },
    });

    const homeControl = new HomeButton();
    map.addControl(homeControl);

    return () => {
      map.removeControl(homeControl);
    };
  }, [map, center, zoom]);

  return null;
};

const MapComponent = memo(() => {
  const { t } = useTranslation();
  // Amberg market square coordinates
  const center: [number, number] = [49.445281069146596, 11.858113076546482];
  const zoom = 13;

  // Zone definitions
  const letterZones = useMemo(() => ["A", "B", "C", "D", "E"], []);
  const numberZones = useMemo(() => ["1", "2", "3", "4"], []);

  // Generate all zone combinations (A1-E4)
  const allZones = useMemo(
    () =>
      letterZones.flatMap((letter) =>
        numberZones.map((number) => `${letter}${number}`)
      ),
    [letterZones, numberZones]
  );

  // Track visible zones for filtering streets on the map
  const [visibleZones, setVisibleZones] = React.useState<Set<string>>(
    new Set(allZones)
  );

  // Lazy load street data asynchronously
  const [streetsData, setStreetsData] = React.useState<StreetWithCoordinates[]>(
    []
  );

  // Track current zoom level for dynamic polyline weight
  const [currentZoom, setCurrentZoom] = React.useState(zoom);

  // Calculate polyline weight based on zoom level
  // Scales from 0.5px (far zoom out) to 5px (zoomed in) for better visibility at all levels
  const getLineWeight = useCallback((zoomLevel: number): number => {
    if (zoomLevel < 10) return 0.5;
    if (zoomLevel < 11) return 1;
    if (zoomLevel < 12) return 1.5;
    if (zoomLevel < 14) return 2.5;
    if (zoomLevel < 15) return 3.5;
    return 5;
  }, []);

  React.useEffect(() => {
    // Load streets data after component mounts to avoid blocking page load
    // This allows the map UI (header, legend, base map tiles) to render immediately
    // while streets are fetched and drawn progressively in the background
    const loadStreets = async () => {
      try {
        const coordinatesData = await getStreetCoordinatesMapping();
        setStreetsData(coordinatesData.streets);
      } catch (error) {
        console.error("Failed to load streets data:", error);
      }
    };

    // Trigger async load immediately after mount
    loadStreets();
  }, []);

  // Toggle individual zone visibility - memoized callback
  const toggleZone = useCallback((zone: string) => {
    setVisibleZones((prev) => {
      const newVisibleZones = new Set(prev);
      if (newVisibleZones.has(zone)) {
        newVisibleZones.delete(zone);
      } else {
        newVisibleZones.add(zone);
      }
      return newVisibleZones;
    });
  }, []);

  const toggleZoneGroup = useCallback(
    (group: string) => {
      setVisibleZones((prev) => {
        const groupZones = numberZones.map((n) => `${group}${n}`);
        const allGroupZonesVisible = groupZones.every((z) => prev.has(z));
        const newVisibleZones = new Set(prev);

        // Toggle entire zone group (all sub-zones together)
        groupZones.forEach((z) => {
          if (allGroupZonesVisible) {
            newVisibleZones.delete(z);
          } else {
            newVisibleZones.add(z);
          }
        });
        return newVisibleZones;
      });
    },
    [numberZones]
  );

  const selectAllZones = useCallback(() => {
    setVisibleZones(new Set(allZones));
  }, [allZones]);

  const clearAllZones = useCallback(() => {
    setVisibleZones(new Set());
  }, []);

  // Define color per zone
  const zoneColors: Record<string, string> = {
    // Red → A (dark to bright)
    A1: "#800000",
    A2: "#cc0000",
    A3: "#ff3333",
    A4: "#ff8080",

    // Green → B (dark to bright)
    B1: "#004d00",
    B2: "#009900",
    B3: "#33ff33",
    B4: "#99ff99",

    // Blue → C (dark to bright)
    C1: "#000099",
    C2: "#0047cc",
    C3: "#3399ff",
    C4: "#99d9ff",

    // Orange → D (dark to bright)
    D1: "#994d00",
    D2: "#ff8000",
    D3: "#ffaa33",
    D4: "#ffd699",

    // Purple → E (dark to bright)
    E1: "#660066",
    E2: "#bb00bb",
    E3: "#dd55ff",
    E4: "#ffb3ff",

    // Unknown / fallback
    unknown: "#474747",
  };

  return (
    <>
      {/* Map header with title and disclaimer */}
      <div className="map-header">
        <h3 className="map-title">{t("map.title")}</h3>
        <p className="map-hint">{t("map.hint")}</p>
      </div>
      <div className="map-component">
        {/* Map container with streets colored by zone */}
        <div className="map-area">
          <MapContainer center={center} zoom={zoom}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; Map data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
            />

            <ZoomHandler onZoomChange={setCurrentZoom} />
            <HomeControl center={center} zoom={zoom} />

            {/* Render street polylines, filtered by visible zones (loaded asynchronously) */}
            {streetsData?.map((street: StreetWithCoordinates) => {
              const zoneUpper = street.zone.toUpperCase();
              if (!visibleZones.has(zoneUpper)) {
                return null;
              }
              const color = zoneColors[zoneUpper] || "#474747";
              const weight = getLineWeight(currentZoom);
              return (
                <Polyline
                  key={`${street.name}-${street.zone}-${street.coords}`}
                  positions={street.coords}
                  pathOptions={{
                    color,
                    weight,
                  }}
                />
              );
            })}
          </MapContainer>
        </div>

        <aside className="map-legend" aria-label="Zone legend">
          {/* Select/Clear all buttons */}
          <div className="legend-controls">
            <button className="legend-button" onClick={selectAllZones}>
              {t("map.select_all")}
            </button>
            <button className="legend-button" onClick={clearAllZones}>
              {t("map.clear_all")}
            </button>
          </div>
          {/* Zone groups with clickable items to toggle visibility */}
          {letterZones.map((g) => (
            <div key={g} className="legend-group">
              <button
                className="legend-group-title"
                onClick={() => toggleZoneGroup(g)}
                title="Click to toggle zone group"
              >
                {t("map.zone_label")} {g}
              </button>
              <div className="legend-items">
                {numberZones.map((n) => {
                  const key = `${g}${n}`;
                  const color = zoneColors[key] || zoneColors.unknown;
                  const isVisible = visibleZones.has(key);
                  return (
                    <button
                      key={key}
                      className="legend-item"
                      onClick={() => toggleZone(key)}
                      style={{
                        opacity: isVisible ? 1 : 0.4,
                      }}
                      title="Click to toggle zone"
                    >
                      <span className="swatch" style={{ background: color }} />
                      <span className="legend-label">{key}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>
      </div>
      <p className="map-hint">
        {" "}
        &copy; Map data provided by{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenStreetMap
        </a>{" "}
        Go have a look at their amazing work{" "}
        <a
          href="https://www.openstreetmap.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          here!
        </a>
      </p>
    </>
  );
});

export default memo(MapComponent);
