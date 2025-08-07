import { useEffect, useState } from 'react'
import { fetchSchedule } from '../api/wasteAPI'
import type { Schedule } from '../api/wasteAPI'

function SchedulePage() {
  const [data, setData] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSchedule('B1')
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading…</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!data) return null

  return (
    <div>
      <h2>Zone: {data.zone}</h2>
      <p>Reference date: {data.reference_date}</p>
    </div>
  )
}

export default SchedulePage