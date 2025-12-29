import api from "./axios";
import type { NextPickups } from "../types/nextPickups";
import { CACHE_MAX_AGE, NEXT_PICKUPS_CACHE_KEY } from "./wasteAPI";

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
  if (!pickupStr) {
    return Promise.reject(new Error("Couldn't read cache"));
  }
  try {
    const nextPickups: NextPickups = JSON.parse(pickupStr);
    return Promise.resolve(nextPickups);
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
  if (!pickupStr) {
    return false;
  }
  try {
    const nextPickups: NextPickups = JSON.parse(pickupStr);
    if (nextPickups.zone != zone) {
      return false;
    }
    const todayStr = getTodaysDate();
    if (nextPickups.reference_date != todayStr) {
      return false;
    }
    if (
      nextPickups.cachedAt &&
      Date.now() - nextPickups.cachedAt > CACHE_MAX_AGE
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
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
