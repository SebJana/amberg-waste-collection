import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ZoneCodeInput from "../components/ZoneCodeInput/ZoneCodeInput";
import "../pages/HomePage.css";

// Check if a valid code has been given into the input field
function checkValidZoneCode(code: string){
    const validCodePattern = /^[A-E][1-4]$/
    // Code is invalid
    if (code == null || code == ""){
        return false;
    }
    // Code doesn't have correct length
    if (code.length != 2){
        return false;
    }
    // Code doesn't name an existing zone
    if (!validCodePattern.test(code)){
        return false;
    }
    return true;
}

export default function HomePage() {
  const [zoneCode, setZoneCode] = useState("");
  const [zoneCodeFeedback, setZoneCodeFeedback] = useState("");

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user given zone code is valid upon hitting submit
    if (!checkValidZoneCode(zoneCode)) {
      setZoneCodeFeedback(t('zone_input.feedback_invalid_code'));
      return;
    }
    // Navigate to the schedule page with the given zone code
    navigate(`/schedule/${zoneCode}`);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="home-page">
      <p className="zone-input-title">{t('zone_input.title')}</p>
      <h3 className="zone-input-help">{t('zone_input.help')} <a href="https://amberg.de/abfallberatung">https://amberg.de/abfallberatung</a> {t('zone_input.help2')}</h3>
      <ZoneCodeInput value={zoneCode} onChange={setZoneCode} />
      <button type="submit">{t('zone_input.button')}</button>
    </form>
    <p className="zone-input-feedback">{zoneCodeFeedback}</p>
    </>
  );
}