import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ZoneCodeInput from "../../components/ZoneCodeInput/ZoneCodeInput";
import StreetInput from "../../components/StreetInput/StreetInput";
import MapComponent from "../../components/MapComponent/MapComponent";
import checkValidZoneCode from "../../utilities/validZoneCode";
import { getStreetZoneMapping } from "../../api/wasteAPI";
import type { StreetZoneMapping } from "../../types/streetZones";
import "./HomePage.css";

export default function HomePage() {
  const [zoneCode, setZoneCode] = useState("");
  const [invalidCode, setInvalidCode] = useState<string | null>(null);
  const [streetZoneMapping, setStreetZoneMapping] =
    useState<StreetZoneMapping | null>(null);
  const [selectedStreet, setSelectedStreet] = useState("");
  const [invalidStreet, setInvalidStreet] = useState<string | null>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    getStreetZoneMapping()
      .then((mapping) => setStreetZoneMapping(mapping))
      .catch(() => setStreetZoneMapping(null));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user given zone code is valid upon hitting submit
    if (!checkValidZoneCode(zoneCode)) {
      setInvalidCode(zoneCode);
      return;
    }
    // Navigate to the schedule page with the given zone code
    navigate(`/schedule/${zoneCode}`);
  };

  const handleStreetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetZoneMapping) return;
    const zone = streetZoneMapping[selectedStreet];
    if (!zone) {
      setInvalidStreet(selectedStreet);
      return;
    }
    navigate(`/schedule/${zone}`);
  };

  const feedback = invalidCode
    ? t("zone_input.feedback_invalid_code", { zone_code: invalidCode })
    : "";

  return (
    <div className="home-page">
      <h1>{t("home.title")}</h1>
      <h2 className="home-description">{t("home.description")}</h2>
      <div className="home-margin"></div>
      <div className="input-container">
        <h2 className="zone-input-title">{t("zone_input.title")}</h2>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="zone-input-box">
            <ZoneCodeInput value={zoneCode} onChange={setZoneCode} />
          </div>
          <button type="submit" disabled={zoneCode.length === 0}>
            {t("zone_input.button")}
          </button>
          {feedback && <p className="zone-input-feedback">{feedback}</p>}
        </form>

        <h3 className="zone-input-help">
          {t("zone_input.help")}{" "}
          <a href="https://amberg.de/abfallberatung">
            https://amberg.de/abfallberatung
          </a>{" "}
          {t("zone_input.help2")}
        </h3>

        <h2 className="street-input-title">{t("street_input.title")}</h2>
        <form onSubmit={handleStreetSubmit} className="input-form">
          <StreetInput
            selectedStreet={selectedStreet}
            onChange={setSelectedStreet}
            options={Object.keys(streetZoneMapping ?? {})}
          />
          <button type="submit" disabled={selectedStreet.length === 0}>
            {t("street_input.button")}
          </button>
          {invalidStreet && (
            <p className="street-input-feedback">
              {t("street_input.feedback_invalid_street", {
                street: invalidStreet,
              })}
            </p>
          )}
        </form>
      </div>
      <MapComponent />
    </div>
  );
}
