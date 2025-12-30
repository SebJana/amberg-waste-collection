// Input date has to be formatted like YYYY-MM-DD
export function formatDateOnLanguage(date: string, lang: "en" | "de"): string {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);

  if (lang === "en") {
    return `${month}/${day}/${year}`; // MM/DD/YYYY
  }
  return `${day}.${month}.${year}`; // DD.MM.YYYY
}

export function getDayName(dateStr: string, lang: "en" | "de") {
  const date = new Date(dateStr);

  if (lang === "en") {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  if (lang === "de") {
    return date.toLocaleDateString("de-DE", { weekday: "long" });
  }
  // Default to english names for the weekdays
  return date.toLocaleDateString("en-US", { weekday: "long" });
}
