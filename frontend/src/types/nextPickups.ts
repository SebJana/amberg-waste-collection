// { type: "Restmüll", date: "2025-08-08"}
type Pickup = {
  type: string
  date: string
}

export type NextPickups = {
  zone: string
  reference_date: string
  next_pickups: Pickup[]
  cachedAt?: number
}