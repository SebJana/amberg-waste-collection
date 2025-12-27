import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import "./StreetInput.css";

interface StreetInputProps {
  readonly selectedStreet: string;
  readonly onChange: (value: string) => void;
  readonly options: string[];
}

export default function StreetInput({
  selectedStreet,
  onChange,
  options,
}: StreetInputProps) {
  const { t } = useTranslation();

  if (options.length === 0) {
    return (
      <div className="street-search-placeholder">
        {t("street_input.no_data_placeholder") || "No street data available"}
      </div>
    );
  }

  return (
    <div className="street-search">
      <Autocomplete
        options={options}
        value={selectedStreet || undefined}
        onChange={(_, newValue) => onChange(newValue || "")}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("street_input.placeholder")}
            size="medium"
            sx={{
              "& .MuiInputLabel-root": {
                color: "var(--text-secondary)",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "var(--fg)",
              },
            }}
          />
        )}
        disableClearable
      />
    </div>
  );
}
