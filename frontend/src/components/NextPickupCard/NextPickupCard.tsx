import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { parse } from "date-fns";
import { Trash2 } from "lucide-react";
import { formatDateOnLanguage } from '../../utilities/DateFormatter';
import { WasteTypeColors } from '../../utilities/BinColors';
import "./NextPickupCard.css";

type CardProps = {
  readonly type: string;
  readonly date: string;
};

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

function determineBinColor(type: string): string {
    if (type in WasteTypeColors) {
        return WasteTypeColors[type as keyof typeof WasteTypeColors];
    }
    // Default to gray as color
    return WasteTypeColors["Restmüll"];
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