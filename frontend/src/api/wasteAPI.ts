import api from './axios';
import type NextPickups from '../interfaces/nextPickups';
import type Schedule from '../interfaces/schedule';

// Cache maximum age in milliseconds (10 minutes)
const CACHE_MAX_AGE = 10 * 60 * 1000;

// Both the next pickups and the schedule get cached
// That cache is valid until either the user selects a different zone code,
// the cache is invalidated because the reference date (in the cached API response)
// and today's date don't match, or the cache is older than 10 minutes

// Returns a date string of todays date formatted like YYYY-MM-DD
function getTodaysDate(){
  return new Date().toISOString().split("T")[0];
}

export async function getNextPickups(zone: string): Promise<NextPickups> {
  if(checkIfValidPickupsInCache(zone)) {
      return getPickupsFromCache();
  }
  return await fetchNextPickups(zone);
}

function getPickupsFromCache(): Promise<NextPickups> {
  const pickupStr = localStorage.getItem("nextPickups");
  // Abort if cache is empty
  if (!pickupStr) {
    return Promise.reject(new Error("Couldn't read cache"));
  }
  // Abort if parsing fails
  try {
    const nextPickups: NextPickups = JSON.parse(pickupStr);
    return Promise.resolve(nextPickups); // Successfully extracted cache
  } catch {
    return Promise.reject(new Error("Invalid cache format"));
  }
}

function cachePickups(pickups: NextPickups) {
  const pickupWithTimestamp = { ...pickups, cachedAt: Date.now() };
  const pickupStr = JSON.stringify(pickupWithTimestamp);
  localStorage.setItem('nextPickups', pickupStr)
}

function checkIfValidPickupsInCache(zone: string) {
  const pickupStr = localStorage.getItem('nextPickups');
  // Cache is empty
  if(!pickupStr){
    return false;
  }
  try{
    const nextPickups: NextPickups = JSON.parse(pickupStr);
    // Element in cache isn't from requested zone
    if(nextPickups.zone != zone){
      return false;
    }
    // Cache is outdated (different date)
    const todayStr = getTodaysDate();
    if(nextPickups.reference_date != todayStr){
      return false;
    }
    // Cache is older than 10 minutes
    if (nextPickups.cachedAt && Date.now() - nextPickups.cachedAt > CACHE_MAX_AGE) {
      return false;
    }
    return true; // Default: Cache is valid
  } catch{
    return false; // False if cache couldn't be parsed
  }
}


export async function fetchNextPickups(zone: string): Promise<NextPickups> {
  const response = await api.get<NextPickups>(`/waste-collection/${zone}/next`);
  const data = response.data;
  cachePickups(data);
  return data;
}

export async function getSchedule(zone: string): Promise<Schedule> {
  if(checkIfValidScheduleInCache(zone)) {
      return getScheduleFromCache();
  }
  return await fetchSchedule(zone);
}

function getScheduleFromCache(): Promise<Schedule> {
  const scheduleStr = localStorage.getItem("schedule");
  // Abort if cache is empty
  if (!scheduleStr) {
    return Promise.reject(new Error("Couldn't read cache"));
  }
  // Abort if parsing fails
  try {
    const schedule: Schedule = JSON.parse(scheduleStr);
    return Promise.resolve(schedule); // Successfully extracted cache
  } catch {
    return Promise.reject(new Error("Invalid cache format"));
  }
}

function cacheSchedule(schedule: Schedule) {
  const scheduleWithTimestamp = { ...schedule, cachedAt: Date.now() };
  const scheduleStr = JSON.stringify(scheduleWithTimestamp);
  localStorage.setItem('schedule', scheduleStr)
}

function checkIfValidScheduleInCache(zone: string) {
  const scheduleStr = localStorage.getItem('schedule');
  // Cache is empty
  if(!scheduleStr){
    return false;
  }
  try{
    const schedule: Schedule = JSON.parse(scheduleStr);
    // Element in cache isn't from requested zone
    if(schedule.zone != zone){
      return false;
    }
    // Cache is outdated
    const todayStr = getTodaysDate();
    if(schedule.reference_date != todayStr){
      return false;
    }
    // Cache is older than 10 minutes
    if (schedule.cachedAt && Date.now() - schedule.cachedAt > CACHE_MAX_AGE) {
      return false;
    }
    return true; // Default: Cache is valid
  } catch{
    return false; // False if cache couldn't be parsed
  }
}


export async function fetchSchedule(zone: string): Promise<Schedule> {
  const response = await api.get<Schedule>(`/waste-collection/${zone}/schedule`);
  const data = response.data;
  cacheSchedule(data);
  return data;
}