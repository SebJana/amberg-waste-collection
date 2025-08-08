import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { fetchNextPickups, fetchSchedule } from '../api/wasteAPI'
import type { NextPickups, Schedule } from '../api/wasteAPI'

function SchedulePage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const [pickups, setPickups] = useState<NextPickups | null>(null)
  const [pickupsLoading, setPickupsLoading] = useState(true)
  const [pickupsError, setPickupsError] = useState<string | null>(null)

  const { zoneCode = "" } = useParams();

  console.log("Fetching schedule for zoneCode:", zoneCode);

  useEffect(() => {
    // Fetch both in parallel
    fetchSchedule(zoneCode)
      .then(setSchedule)
      .catch(err => setScheduleError(err.message))
      .finally(() => setScheduleLoading(false));

    fetchNextPickups(zoneCode)
      .then(setPickups)
      .catch(err => setPickupsError(err.message))
      .finally(() => setPickupsLoading(false));
  }, [zoneCode]);

  if (scheduleLoading || pickupsLoading) return <p>Loading…</p>
  if (scheduleError) return <p style={{ color: 'red' }}>{scheduleError}</p>
  if (pickupsError) return <p style={{ color: 'red' }}>{pickupsError}</p>
  if (!schedule || !pickups) return null

  // Only display if both next pickups and full schedule were fetched successfully
  return (
    <div>
      <h2>Zone: {pickups.zone}</h2>
      <p>Reference date: {pickups.reference_date}</p>


      <h2>Zone: {schedule.zone}</h2>
      <p>Reference date: {schedule.reference_date}</p>

    </div>
  )
}

export default SchedulePage