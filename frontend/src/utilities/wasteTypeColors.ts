const WasteTypeColors = {
    "Restmüll": "#949494",
    "Biomüll": "#69370e",
    "Papiermüll": "#3289ed",
    "Gelber Sack": "#edd732"
}

export function getWasteTypeColor(type: string): string {
    if (type in WasteTypeColors) {
        return WasteTypeColors[type as keyof typeof WasteTypeColors];
    }
    // Default to gray as color
    return WasteTypeColors["Restmüll"];
}