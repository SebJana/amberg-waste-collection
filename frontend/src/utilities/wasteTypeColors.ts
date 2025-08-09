const WasteTypeColors = {
    "Restmüll": "#949494",
    "Biomüll": "#69370e",
    "Papiermüll": "#3289ed",
    "Gelber Sack": "#edd732"
}

const WasteTypeFontColors = {
  "Restmüll": "#f9f9f9",     
  "Biomüll": "#f9f9f9",
  "Papiermüll": "#f9f9f9",
  "Gelber Sack": "#1a1a1a",
};

export function getWasteTypeColor(type: string): string {
    if (type in WasteTypeColors) {
        return WasteTypeColors[type as keyof typeof WasteTypeColors];
    }
    // Default to gray as color
    return WasteTypeColors["Restmüll"];
}

export function getWasteTypeFontColor(type: string): string {
    if (type in WasteTypeFontColors) {
        return WasteTypeFontColors[type as keyof typeof WasteTypeFontColors];
    }
    // Default to white as font color
    return WasteTypeFontColors["Restmüll"];
}