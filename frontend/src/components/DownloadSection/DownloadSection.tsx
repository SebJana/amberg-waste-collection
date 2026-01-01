import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Download, List, Calendar } from "lucide-react";
import type { AvailableDownloadLinks } from "../../types/availableDownloadLinks";
import "./DownloadSection.css";

interface DownloadSectionProps {
  readonly availability: AvailableDownloadLinks;
  readonly zoneCode: string;
}

/**
 * DownloadSection - Interactive PDF download selector
 * Allows users to choose a waste collection format (List/Calendar) and year,
 * then provides a direct download link to the PDF from the Amberg website.
 */
function DownloadSection({ availability, zoneCode }: DownloadSectionProps) {
  // UI state
  const [downloadExpanded, setDownloadExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedResultType, setSelectedResultType] = useState<string | null>(
    null
  );

  const { t, i18n } = useTranslation();

  // Get translated label for format, fallback to API name if translation not found
  const getFormatLabel = (format: string): string => {
    return t(`download.format_options.${format}`, format);
  };

  // Get appropriate icon for format type, fallback to no icon if not specified here
  const getFormatIcon = (format: string) => {
    switch (format) {
      case "Listen":
        return <List size={16} />;
      case "Kalender":
        return <Calendar size={16} />;
      default:
        return null;
    }
  };

  // Check if selected year and format combination is available
  const isYearAvailable = (year: number): boolean => {
    const yearData = availability.availability[year];
    return yearData && Object.values(yearData).some(Boolean);
  };

  const isCombinationAvailable =
    selectedYear !== null &&
    selectedResultType !== null &&
    (availability.availability[selectedYear]?.[selectedResultType] ?? false);

  return (
    <div className="download-section">
      <button
        className="download-toggle"
        onClick={() => setDownloadExpanded(!downloadExpanded)}
      >
        <div className="download-title">
          <Download size={20} />
          <span>{t("download.title")}</span>
        </div>
        <ChevronDown
          size={20}
          style={{
            transform: downloadExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>

      {downloadExpanded && (
        <div className="download-options">
          {/* Format selection (List/Calendar) */}
          <div className="option-group">
            <label>{t("download.result_type")}</label>
            <div className="option-buttons">
              {availability.result_types.map((type) => (
                <button
                  key={type}
                  className={`option-btn ${
                    selectedResultType === type ? "selected" : ""
                  }`}
                  onClick={() => setSelectedResultType(type)}
                  title={getFormatLabel(type)}
                >
                  {getFormatIcon(type)}
                  <span>{getFormatLabel(type)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Year selection - grayed out if no formats available for that year */}
          <div className="option-group">
            <label>{t("download.year")}</label>
            <div className="option-buttons">
              {Object.keys(availability.availability)
                .map((y) => Number.parseInt(y))
                .sort((a, b) => a - b)
                .map((year) => {
                  const available = isYearAvailable(year);
                  return (
                    <button
                      key={year}
                      className={`option-btn ${
                        selectedYear === year ? "selected" : ""
                      } ${available ? "" : "unavailable"}`}
                      onClick={() => setSelectedYear(year)}
                      disabled={!available}
                    >
                      {year}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Download button - enabled only with valid year/format combo */}
          <div className="download-link-section">
            {/* Build the correct url link dynamically based on the zone and selected options */}
            {isCombinationAvailable ? (
              <a
                href={availability.url_template.template
                  .replace("{year}", selectedYear.toString())
                  .replace("{result_type}", selectedResultType)
                  .replace("{zone}", zoneCode)}
                target="_blank"
                rel="noopener noreferrer"
                className="download-link"
              >
                {t("download.get")}
              </a>
            ) : (
              <button
                className="download-link disabled"
                disabled
                title={
                  selectedYear === null || selectedResultType === null
                    ? t("download.select_required")
                    : t("download.unavailable")
                }
              >
                {t("download.get")}
              </button>
            )}
            {/* Note about external link */}
            <p className="external-link-note">
              {t("download.external_link_note")}
            </p>
            {/* Note about the download options being in german if not in selected language german */}
            {i18n.language !== "de" && (
              <p className="external-link-note">
                {t("download.language_note")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DownloadSection;
