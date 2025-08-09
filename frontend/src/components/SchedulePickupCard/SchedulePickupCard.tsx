import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { formatDateOnLanguage } from '../../utilities/dateFormatter';
import { getWasteTypeColor, getWasteTypeFontColor } from '../../utilities/wasteTypeColors';
import './SchedulePickupCard.css'

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
        <div className="schedule-card">
            <p className="schedule-card-title">{dateStr}</p>

            <div className="schedule-type-list">
                {types.map((type) => (
                <div
                    key={type}
                    className="schedule-type-item"
                    style={{
                        backgroundColor: getWasteTypeColor(type),
                        color: getWasteTypeFontColor(type)
                    }}
                >
                    {t(`waste_types.${type}`)}
                </div>
                ))}
            </div>
        </div>
    );
}