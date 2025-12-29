import api from "./axios";
import type { Schedule } from "../types/schedule";
import { CACHE_MAX_AGE, SCHEDULE_CACHE_KEY } from "./wasteAPI";

function getTodaysDate() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Retrieves the waste collection schedule for a given zone.
 * Uses caching to avoid unnecessary API calls.
 * @param zone - The zone code to get the schedule for.
 * @returns A promise that resolves to the schedule data.
 */
export async function getSchedule(zone: string): Promise<Schedule> {
  if (checkIfValidScheduleInCache(zone)) {
    return getScheduleFromCache();
  }
  return await fetchSchedule(zone);
}

/**
 * Retrieves cached schedule data from localStorage.
 * @returns A promise that resolves to the cached schedule data, or rejects if cache is invalid.
 */
function getScheduleFromCache(): Promise<Schedule> {
  const scheduleStr = localStorage.getItem(SCHEDULE_CACHE_KEY);
  if (!scheduleStr) {
    return Promise.reject(new Error("Couldn't read cache"));
  }
  try {
    const schedule: Schedule = JSON.parse(scheduleStr);
    return Promise.resolve(schedule);
  } catch {
    return Promise.reject(new Error("Invalid cache format"));
  }
}

function cacheSchedule(schedule: Schedule) {
  const scheduleWithTimestamp = { ...schedule, cachedAt: Date.now() };
  const scheduleStr = JSON.stringify(scheduleWithTimestamp);
  localStorage.setItem(SCHEDULE_CACHE_KEY, scheduleStr);
}

/**
 * Checks if valid cached schedule exists for the given zone.
 * Validates zone match, date, and cache age.
 * @param zone - The zone code to check cache for.
 * @returns True if valid cache exists, false otherwise.
 */
function checkIfValidScheduleInCache(zone: string) {
  const scheduleStr = localStorage.getItem(SCHEDULE_CACHE_KEY);
  if (!scheduleStr) {
    return false;
  }
  try {
    const schedule: Schedule = JSON.parse(scheduleStr);
    if (schedule.zone != zone) {
      return false;
    }
    const todayStr = getTodaysDate();
    if (schedule.reference_date != todayStr) {
      return false;
    }
    if (schedule.cachedAt && Date.now() - schedule.cachedAt > CACHE_MAX_AGE) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches the waste collection schedule from the API and caches the result.
 * @param zone - The zone code to fetch schedule for.
 * @returns A promise that resolves to the fetched schedule data.
 */
export async function fetchSchedule(zone: string): Promise<Schedule> {
  const response = await api.get<Schedule>(
    `/waste-collection/${zone}/schedule`
  );
  const data = response.data;
  cacheSchedule(data);
  return data;
}
