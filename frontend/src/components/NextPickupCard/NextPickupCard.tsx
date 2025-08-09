import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { parse } from "date-fns";
import { Trash2 } from "lucide-react";
import "./NextPickupCard.css";


type CardProps = {
  type: string;
  date: string;
};

const binColors = {
    "Restmüll": "#949494",
    "Biomüll": "#4d2200",
    "Papiermüll": "#3289ed",
    "Gelber Sack": "#edd732"
}

// Return the amount of days till the pickup date
function calculateDaysTillPickup(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize

  const pickupDate = parse(date, "yyyy-MM-dd", new Date());
  pickupDate.setHours(0, 0, 0, 0); // normalize

  const oneDayMs = 1000 * 60 * 60 * 24;
  const diffMs = pickupDate.getTime() - today.getTime();

  return Math.ceil(diffMs / oneDayMs);
}

// Input date has to be formatted like YYYY-MM-DD
function formatDateOnLanguage(date: string, lang: "en" | "de"): string{
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    
    if (lang === "en") {
        return `${month}/${day}/${year}`; // MM/DD/YYYY
    }
    return `${day}.${month}.${year}`;   // DD.MM.YYYY
}

function determineBinColor(type: string): string {
    if (type in binColors) {
        return binColors[type as keyof typeof binColors];
    }
    // Default to gray as color
    return binColors["Restmüll"];
}

function determineDaysString(days: number, t: TFunction) {
  if (days === 0){
    return t("next_pickups.today");
  }
  if (days === 1){
    return t("next_pickups.tomorrow");
  }
  return t("next_pickups.days", { count: days });
}

export default function Card({ type, date }: CardProps) {
    const [dateStr, setDateStr] = useState("");
    const [binColor, setBinColor] = useState("");
    const [daysStr, setDaysStr] = useState("");

    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    useEffect(() => {
        // Calculate days and the corresponding string
        const nextDays = calculateDaysTillPickup(date);
        const nextDaysStr = determineDaysString(nextDays, t);

        setDaysStr(nextDaysStr);
        setDateStr(formatDateOnLanguage(date, lang.startsWith("de") ? "de" : "en"));
        setBinColor(determineBinColor(type));
    }, [date, type, lang, t]);
    

    return (
        <div className="card">
            <p className="card-title">{t(`waste_types.${type}`)}</p>
            <Trash2 size={75} color={binColor} />
            <p className="card-day-count">{daysStr}</p>
            <p className="card-date">{dateStr}</p>
        </div>
    );
}