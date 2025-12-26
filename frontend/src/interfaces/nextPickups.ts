// { type: "Restmüll", date: "2025-08-08"}
interface Pickup {
  type: string
  date: string
}

export default interface NextPickups {
  zone: string
  reference_date: string
  next_pickups: Pickup[]
  cachedAt?: number
}