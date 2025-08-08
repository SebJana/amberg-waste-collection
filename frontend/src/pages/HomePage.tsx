import { useState } from "react";
import { useTranslation } from 'react-i18next';
import ZoneCodeInput from "../components/ZoneCodeInput/ZoneCodeInput";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user given zone code is valid upon hitting submit
    if (!checkValidZoneCode(zoneCode)) {
      setZoneCodeFeedback(t('zone_input.feedback_invalid'));
      return;
    }
    setZoneCodeFeedback(t('zone_input.feedback_valid'));
    console.log("Submitted zone code:", zoneCode);
    // API call or other logic here
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="home-page">
      <h1>{t('zone_input.title')}</h1>
      <ZoneCodeInput value={zoneCode} onChange={setZoneCode} />
      <button type="submit">{t('zone_input.button')}</button>
    </form>
    <p>{zoneCodeFeedback}</p>
    </>
  );
}