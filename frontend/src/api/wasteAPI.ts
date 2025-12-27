import api from "./axios";
import type { NextPickups } from "../types/nextPickups";
import type { Schedule } from "../types/schedule";
import type { StreetZoneMapping } from "../types/streetZones";

// Cache maximum age in milliseconds (5 minutes)
// There is no heavy work done by the server upon more frequent requests
// keep Cache TTL short, so if data is changed (new schedule for new year added in)
// the client receives it momentarily
const CACHE_MAX_AGE = 5 * 60 * 1000;
// All used cache keys
const SCHEDULE_CACHE_KEY = "schedule";
const NEXT_PICKUPS_CACHE_KEY = "nextPickups";
const STREET_ZONE_MAPPING_CACHE_KEY = "streetZoneMapping";

// Both the next pickups and the schedule get cached
// That cache is valid until either the user selects a different zone code,
// the cache is invalidated because the reference date (in the cached API response)
// and today's date don't match, or the cache is older than 5 minutes

// Returns a date string of todays date formatted like YYYY-MM-DD
/**
 * Gets today's date formatted as YYYY-MM-DD.
 * @returns The current date string in ISO format (YYYY-MM-DD).
 */
function getTodaysDate() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Retrieves the next waste collection pickups for a given zone.
 * Uses caching to avoid unnecessary API calls.
 * @param zone - The zone code to get pickups for.
 * @returns A promise that resolves to the next pickups data.
 */
export async function getNextPickups(zone: string): Promise<NextPickups> {
  if (checkIfValidPickupsInCache(zone)) {
    return getPickupsFromCache();
  }
  return await fetchNextPickups(zone);
}

/**
 * Retrieves cached next pickups data from localStorage.
 * @returns A promise that resolves to the cached pickups data, or rejects if cache is invalid.
 */
function getPickupsFromCache(): Promise<NextPickups> {
  const pickupStr = localStorage.getItem(NEXT_PICKUPS_CACHE_KEY);
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
  localStorage.setItem(NEXT_PICKUPS_CACHE_KEY, pickupStr);
}

/**
 * Checks if valid cached pickups exist for the given zone.
 * Validates zone match, date, and cache age.
 * @param zone - The zone code to check cache for.
 * @returns True if valid cache exists, false otherwise.
 */
function checkIfValidPickupsInCache(zone: string) {
  const pickupStr = localStorage.getItem(NEXT_PICKUPS_CACHE_KEY);
  // Cache is empty
  if (!pickupStr) {
    return false;
  }
  try {
    const nextPickups: NextPickups = JSON.parse(pickupStr);
    // Element in cache isn't from requested zone
    if (nextPickups.zone != zone) {
      return false;
    }
    // Cache is outdated (different date)
    const todayStr = getTodaysDate();
    if (nextPickups.reference_date != todayStr) {
      return false;
    }
    // Cache is older than TTL
    if (
      nextPickups.cachedAt &&
      Date.now() - nextPickups.cachedAt > CACHE_MAX_AGE
    ) {
      return false;
    }
    return true; // Default: Cache is valid
  } catch {
    return false; // False if cache couldn't be parsed
  }
}

/**
 * Fetches the next waste collection pickups from the API and caches the result.
 * @param zone - The zone code to fetch pickups for.
 * @returns A promise that resolves to the fetched pickups data.
 */
export async function fetchNextPickups(zone: string): Promise<NextPickups> {
  const response = await api.get<NextPickups>(`/waste-collection/${zone}/next`);
  const data = response.data;
  cachePickups(data);
  return data;
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
  // Cache is empty
  if (!scheduleStr) {
    return false;
  }
  try {
    const schedule: Schedule = JSON.parse(scheduleStr);
    // Element in cache isn't from requested zone
    if (schedule.zone != zone) {
      return false;
    }
    // Cache is outdated
    const todayStr = getTodaysDate();
    if (schedule.reference_date != todayStr) {
      return false;
    }
    // Cache is older than TTL
    if (schedule.cachedAt && Date.now() - schedule.cachedAt > CACHE_MAX_AGE) {
      return false;
    }
    return true; // Default: Cache is valid
  } catch {
    return false; // False if cache couldn't be parsed
  }
}

async function fetchSchedule(zone: string): Promise<Schedule> {
  const response = await api.get<Schedule>(
    `/waste-collection/${zone}/schedule`
  );
  const data = response.data;
  cacheSchedule(data);
  return data;
}

/**
 * Retrieves the street-to-zone mapping data.
 * Uses caching to avoid unnecessary API calls.
 * @returns A promise that resolves to the street zone mapping.
 */
export async function getStreetZoneMapping(): Promise<StreetZoneMapping> {
  if (checkIfValidStreetZoneMappingInCache()) {
    return getStreetZoneMappingFromCache();
  }
  return await fetchStreetZoneMapping();
}

/**
 * Retrieves cached street-zone mapping from localStorage.
 * @returns A promise that resolves to the cached mapping data, or rejects if cache is invalid.
 */
function getStreetZoneMappingFromCache(): Promise<StreetZoneMapping> {
  const mappingStr = localStorage.getItem(STREET_ZONE_MAPPING_CACHE_KEY);
  // Abort if cache is empty
  if (!mappingStr) {
    return Promise.reject(new Error("Couldn't read cache"));
  }
  // Abort if parsing fails
  try {
    const mapping: StreetZoneMapping = JSON.parse(mappingStr);
    return Promise.resolve(mapping); // Successfully extracted cache
  } catch {
    return Promise.reject(new Error("Invalid cache format"));
  }
}

function cacheStreetZoneMapping(mapping: StreetZoneMapping) {
  const mappingWithTimestamp = { ...mapping, cachedAt: Date.now() };
  const mappingStr = JSON.stringify(mappingWithTimestamp);
  localStorage.setItem(STREET_ZONE_MAPPING_CACHE_KEY, mappingStr);
}

/**
 * Checks if valid cached street-zone mapping exists.
 * Validates cache age.
 * @returns True if valid cache exists, false otherwise.
 */
function checkIfValidStreetZoneMappingInCache() {
  const mappingStr = localStorage.getItem(STREET_ZONE_MAPPING_CACHE_KEY);
  // Cache is empty
  if (!mappingStr) {
    return false;
  }
  try {
    const mapping: StreetZoneMapping = JSON.parse(mappingStr);
    // Cache is older than max expiry TTL
    if (mapping.cachedAt && Date.now() - mapping.cachedAt > CACHE_MAX_AGE) {
      return false;
    }
    return true; // Cache is valid
  } catch {
    return false; // False if cache couldn't be parsed
  }
}

/**
 * Fetches the street-to-zone mapping from the API and caches the result.
 * @returns A promise that resolves to the fetched mapping data.
 */
async function fetchStreetZoneMapping(): Promise<StreetZoneMapping> {
  const response = await api.get<StreetZoneMapping>(
    `/waste-collection/street-zone-mapping`
  );
  const data = response.data;
  cacheStreetZoneMapping(data);
  return data;
}
