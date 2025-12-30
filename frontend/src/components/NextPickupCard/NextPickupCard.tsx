import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { parse } from "date-fns";
import { Trash2 } from "lucide-react";
import {
  formatDateOnLanguage,
  getDayName,
} from "../../utilities/dateFormatter";
import { getWasteTypeColor } from "../../utilities/wasteTypeColors";
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

function determineDaysString(days: number, t: TFunction) {
  if (days === 0) {
    return t("next_pickups.today");
  }
  if (days === 1) {
    return t("next_pickups.tomorrow");
  }
  return t("next_pickups.days", { count: days });
}

export default function Card({ type, date }: CardProps) {
  const [dateStr, setDateStr] = useState("");
  const [binColor, setBinColor] = useState("");
  const [daysStr, setDaysStr] = useState("");
  const [dayOfWeekName, setDayOfWeekName] = useState("");

  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  useEffect(() => {
    if (!date) {
      setDateStr("--");
      setDayOfWeekName("--");
      setDaysStr(t("next_pickups.no_pickup"));
      setBinColor(getWasteTypeColor(type));
      return;
    }

    // Calculate days and the corresponding string
    const nextDays = calculateDaysTillPickup(date);
    const nextDaysStr = determineDaysString(nextDays, t);

    setDaysStr(nextDaysStr);
    setDateStr(formatDateOnLanguage(date, lang.startsWith("de") ? "de" : "en"));
    setDayOfWeekName(getDayName(date, lang.startsWith("de") ? "de" : "en"));
    setBinColor(getWasteTypeColor(type));
  }, [date, type, lang, t]);

  return (
    <div className="pickup-card">
      <p className="pickup-card-title">{t(`waste_types.${type}`)}</p>
      <Trash2 size={75} color={binColor} />
      <p className="pickup-card-day-count">{daysStr}</p>
      <p className="pickup-card-date">{dateStr}</p>
      <p className="pickup-card-date-name">{dayOfWeekName}</p>
    </div>
  );
}
