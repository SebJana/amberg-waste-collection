import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { getNextPickups, getSchedule } from '../../api/wasteAPI';
import type NextPickups from '../../interfaces/nextPickups';
import type Schedule from '../../interfaces/schedule'
import { useTranslation } from 'react-i18next';
import checkValidZoneCode from "../../utilities/validZoneCode";
import Lottie from "lottie-react";
import underMaintenanceAnimation from "../../assets/UnderMaintenance.json";
import notFoundAnimation from "../../assets/404.json";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import NextPickupCard from "../../components/NextPickupCard/NextPickupCard";
import SchedulePickupCard from "../../components/SchedulePickupCard/SchedulePickupCard";
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

  const { t } = useTranslation();

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
    return (
      <>
      <Lottie
        animationData={underMaintenanceAnimation}
        loop={true}
        className="lottie-animation"
      />
      <h2 style={{ textAlign: 'center' }}>{t('error_messages.zone')}</h2>
      </>
    );
  }

  // Show a loading spinner while fetching data
  if (scheduleLoading || pickupsLoading) {
      return <LoadingSpinner />;
  }
  
  // Show a 404 animation if there was an error fetching the schedule or pickups
  if(scheduleError || pickupsError || !schedule || !pickups) {
    console.error("Error fetching data:", scheduleError, pickupsError);
    return (
    <>
      <Lottie
        animationData={notFoundAnimation}
        loop={true}
        className="lottie-animation"
      />
      <h2 style={{ textAlign: 'center' }}>{t('error_messages.server')}</h2>
    </>
  );
  }

  // Only display if both next pickups and full schedule were fetched successfully
  return (
    <div>
      <h2>{t("schedule_page.title", { zone_code: zoneCode })}</h2>
      <h3>{t("next_pickups.title")}</h3>

      <div className="card-row">
        {[...pickups.next_pickups]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((pickup) => (
            <NextPickupCard
              key={pickup.date + "-" + pickup.type}
              type={pickup.type}
              date={pickup.date}
            />
          ))}
      </div>

      <h3>{t("schedule.title")}</h3>

      {Object.entries(schedule.schedule).map(([date, types]) => (
          <SchedulePickupCard 
            key={date + "-" + types[0]}
            types={types}
            date={date} 
          />
      ))}

    </div>
  )
}

export default SchedulePage