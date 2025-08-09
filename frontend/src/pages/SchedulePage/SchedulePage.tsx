import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { getNextPickups, getSchedule } from '../../api/wasteAPI'
import type { NextPickups, Schedule } from '../../api/wasteAPI'
import checkValidZoneCode from "../../components/ValidZoneCode/ValidZoneCode";
import Lottie from "lottie-react";
import underMaintenanceAnimation from "../../assets/UnderMaintenance.json";
import notFoundAnimation from "../../assets/404.json";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import "./SchedulePage.css";

function SchedulePage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [scheduleError, setScheduleError] = useState<string | null>(null)

  const [pickups, setPickups] = useState<NextPickups | null>(null)
  const [pickupsLoading, setPickupsLoading] = useState(true)
  const [pickupsError, setPickupsError] = useState<string | null>(null)

  const { zoneCode = "" } = useParams();
  const validZone = checkValidZoneCode(zoneCode);

  useEffect(() => {
    if (!validZone){
      return;
    }
    // Fetch both in parallel
    getSchedule(zoneCode)
      .then(setSchedule)
      .catch(err => setScheduleError(err.message))
      .finally(() => setScheduleLoading(false));

    getNextPickups(zoneCode)
      .then(setPickups)
      .catch(err => setPickupsError(err.message))
      .finally(() => setPickupsLoading(false));
  }, [zoneCode, validZone]);

  // If the zone code is not valid, show an under maintenance animation
  // Signaling that the user should check the zone code
  if(!validZone) {
    return (<Lottie
      animationData={underMaintenanceAnimation}
      loop={true}
      className="lottie-animation"
    />);
  }

  // Show a loading spinner while fetching data
  if (scheduleLoading || pickupsLoading) {
      return <LoadingSpinner />;
  }
  
  // Show a 404 animation if there was an error fetching the schedule or pickups
  if(scheduleError || pickupsError || !schedule || !pickups) {
    console.error("Error fetching data:", scheduleError, pickupsError);
    return (<Lottie
      animationData={notFoundAnimation}
      loop={true}
      className="lottie-animation"
    />);
  }

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