import { useEffect, useRef, useState } from "react";
import "./ZoneCodeInput.css";

interface ZoneCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

// Controlled two-part input for letter + number with synchronized internal state,
// syncing only on external value changes to avoid input lag,
// and smart focus handling based on cursor position to enable intuitive keyboard navigation and editing.


export default function ZoneCodeInput({ value, onChange }: Readonly<ZoneCodeInputProps>) {
  const [letter, setLetter] = useState(value.charAt(0) || "");
  const [number, setNumber] = useState(value.charAt(1) || "");
  const numberRef = useRef<HTMLInputElement>(null);
  const letterRef = useRef<HTMLInputElement>(null);

  // Sync from parent value only if it's actually different
  useEffect(() => {
    const first = value.charAt(0) || "";
    const second = value.charAt(1) || "";

    if (first !== letter) setLetter(first);
    if (second !== number) setNumber(second);
  }, [value]); // no letter/number here → avoids stale overwrite on typing

  const handleLetterChange = (val: string) => {
    const currentLetter = val.slice(-1).toUpperCase();
    setLetter(currentLetter);
    onChange(currentLetter + number);

    if (currentLetter && !number) numberRef.current?.focus();
  };

  const handleNumberChange = (val: string) => {
    const currentNumber = val.slice(-1);
    setNumber(currentNumber);
    onChange(letter + currentNumber);
  };

  const handleLetterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const pos = e.currentTarget.selectionStart ?? 0;
    // ArrowRight: only move to number field if caret is at end (pos === value length)
    if (e.key === "ArrowRight" && pos === e.currentTarget.value.length) {
      numberRef.current?.focus();
      e.preventDefault();
    }

    // Backspace: only prevent default if caret at start (pos === 0)
    if (e.key === "Backspace" && pos === 0) {
      e.preventDefault();
      onChange(""); // optionally clear all
    }
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const pos = e.currentTarget.selectionStart ?? 0;
    // ArrowLeft: only move to letter field if caret is at start (pos === 0)
    if (e.key === "ArrowLeft" && pos === 0) {
      letterRef.current?.focus();
      e.preventDefault();
    }

    // Backspace: only move to letter field if caret is at start and input is empty
    if (e.key === "Backspace" && pos === 0 && e.currentTarget.value === "") {
      letterRef.current?.focus();
      e.preventDefault();
    }
  };

  return (
    <div className="zone-code-group" role="group" aria-label="Zone code">
      <input
        ref={letterRef}
        className="zone-code-input"
        type="text"
        inputMode="text"
        value={letter}
        onChange={(e) => handleLetterChange(e.target.value)}
        onKeyDown={handleLetterKeyDown}
        maxLength={1}
        aria-label="Zone letter"
      />
      <input
        ref={numberRef}
        className="zone-code-input"
        type="text"
        inputMode="numeric"
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        onKeyDown={handleNumberKeyDown}
        maxLength={1}
        aria-label="Zone number"
      />
      <input type="hidden" value={`${letter}${number}`} />
    </div>
  );
}
