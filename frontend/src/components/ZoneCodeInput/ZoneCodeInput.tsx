import { useEffect, useRef, useState } from "react";
import "./ZoneCodeInput.css";

interface ZoneCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ZoneCodeInput({ value, onChange}: Readonly<ZoneCodeInputProps>) {
  const [letter, setLetter] = useState(value.charAt(0) || "");
  const [number, setNumber] = useState(value.charAt(1) || "");
  const numberRef = useRef<HTMLInputElement>(null);

  // Keep local letter/number state in sync if parent `value` changes externally
  useEffect(() => {
    setLetter(value.charAt(0) || ""); // First character of value, or empty string
    setNumber(value.charAt(1) || ""); // Second character of value, or empty string
  }, [value]);

  // Handle typing in the letter box
  const handleLetterChange = (val: string) => {
    // Take only the last typed character and make it uppercase
    const currentLetter = val.slice(-1).toUpperCase();

    setLetter(currentLetter);
    onChange(currentLetter + number);

    // If a letter was entered and the number box is empty, auto-focus the number box
    if (currentLetter && !number) numberRef.current?.focus();
  };

  // Handle typing in the number box
  const handleNumberChange = (val: string) => {
    // Take only the last typed character (no transform)
    const currentNumber = val.slice(-1);

    setNumber(currentNumber);
    onChange(letter + currentNumber);
  };

  return (
    <div className="zone-code-group" role="group" aria-label="Zone code">
        <input
            className="zone-code-input"
            type="text"
            inputMode="text"
            value={letter}
            onChange={(e) => handleLetterChange(e.target.value)}
            maxLength={1}
            aria-label="Zone letter"
        />
        <input
            ref={numberRef}
            className="zone-code-input"
            type="text" // Use text type, so that no formatting is the same as the letter input boxs
            inputMode="numeric"
            value={number}
            onChange={(e) => handleNumberChange(e.target.value)}
            maxLength={1}
            aria-label="Zone number"
        />
        {/* Hidden input combines letter + number for form submission */}
        <input type="hidden" value={`${letter}${number}`} /> 
    </div>
  );
}
