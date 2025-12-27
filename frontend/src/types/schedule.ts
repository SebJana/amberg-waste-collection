export type Schedule = {
  zone: string
  reference_date: string
  schedule: {
    [date: string]: string[] // e.g., "2025-08-08": ["Restmüll", "Biomüll"]
  }
  cachedAt?: number
}