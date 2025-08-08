import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ZoneCodeInput from "../../components/ZoneCodeInput/ZoneCodeInput";
import checkValidZoneCode from "../../components/ValidZoneCode/ValidZoneCode";
import "./HomePage.css";

export default function HomePage() {
  const [zoneCode, setZoneCode] = useState("");
  const [zoneCodeFeedback, setZoneCodeFeedback] = useState("");

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user given zone code is valid upon hitting submit
    if (!checkValidZoneCode(zoneCode)) {
      const feedback = t('zone_input.feedback_invalid_code') + " " + zoneCode + " " + t('zone_input.feedback_invalid_code2');
      setZoneCodeFeedback(feedback);
      return;
    }
    // Navigate to the schedule page with the given zone code
    navigate(`/schedule/${zoneCode}`);
  };

  return (
    <>
    <p className="zone-input-title">{t('zone_input.title')}</p>
    <h3 className="zone-input-help">{t('zone_input.help')} <a href="https://amberg.de/abfallberatung">https://amberg.de/abfallberatung</a> {t('zone_input.help2')}</h3>
    <form onSubmit={handleSubmit} className="input-form">
      <ZoneCodeInput value={zoneCode} onChange={setZoneCode} />
      <button type="submit">{t('zone_input.button')}</button>
      <p className="zone-input-feedback">{zoneCodeFeedback}</p>
    </form>
    </>
  );
}