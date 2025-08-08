import { useState } from "react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if user given zone code is valid upon hitting submit
    if (!checkValidZoneCode(zoneCode)) {
      setZoneCodeFeedback("Invalid zone code given!");
      return;
    }
    setZoneCodeFeedback("Successfully submitted code!");
    console.log("Submitted zone code:", zoneCode);
    // API call or other logic here
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="home-page">
      <ZoneCodeInput value={zoneCode} onChange={setZoneCode} />
      <button type="submit">Search</button>
    </form>
    <p>{zoneCodeFeedback}</p>
    </>
  );
}