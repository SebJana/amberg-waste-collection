import api from './axios'

// { "type": "Restmüll, "date": "2025-08-08"}
export interface Pickup {
  type: string
  date: string
}

export interface NextPickups {
  zone: string
  reference_date: string
  next_pickups: Pickup[]
}

export interface Schedule {
  zone: string
  reference_date: string
  schedule: {
    [date: string]: string[] // e.g., "2025-08-08": ["Restmüll", "Biomüll"]
  }
}

export async function fetchNextPickups(zone: string): Promise<NextPickups> {
  const response = await api.get<NextPickups>(`/api/waste-collection/${zone}/next`)
  console.log(response.data)
  return response.data
}

export async function fetchSchedule(zone: string): Promise<Schedule> {
  const response = await api.get<Schedule>(`/api/waste-collection/${zone}/schedule`)
  console.log(response.data)
  return response.data
}