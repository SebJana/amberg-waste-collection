// Input date has to be formatted like YYYY-MM-DD
export function formatDateOnLanguage(date: string, lang: "en" | "de"): string{
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    
    if (lang === "en") {
        return `${month}/${day}/${year}`; // MM/DD/YYYY
    }
    return `${day}.${month}.${year}`;   // DD.MM.YYYY
}