import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { formatDateOnLanguage } from '../../utilities/dateFormatter';
import { getWasteTypeColor } from '../../utilities/wasteTypeColors';
import "./NextPickupCard.css";

type CardProps = {
    readonly types: string[];
    readonly date: string;
};

export default function Card({ date, types }: CardProps) {
    const [dateStr, setDateStr] = useState("");

    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    useEffect(() => {
        setDateStr(formatDateOnLanguage(date, lang.startsWith("de") ? "de" : "en"));
    }, [date, lang, t]);

    return (
        <div className="card">
            <p className="card-title">{dateStr}</p>

            <div className="type-list">
                {types.map((type) => (
                <div
                    key={type}
                    className="type-item"
                    style={{
                        backgroundColor: getWasteTypeColor(type),
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        display: "inline-block",
                    }}
                >
                    {type}
                </div>
                ))}
            </div>
        </div>
    );
}