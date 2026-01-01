import api from "./axios";
import type { AvailableDownloadLinks } from "../types/availableDownloadLinks";
import {
  CACHE_MAX_AGE,
  DOWNLOAD_LINKS_AVAILABILITY_CACHE_KEY,
} from "./wasteAPI";

/**
 * Retrieves the download links availability state.
 * Uses caching to avoid unnecessary API calls.
 * @returns A promise that resolves to the availability data.
 */
export async function getDownloadLinksAvailability(): Promise<AvailableDownloadLinks> {
  if (checkIfValidAvailabilityInCache()) {
    return getAvailabilityFromCache();
  }
  return await fetchDownloadLinksAvailability();
}

/**
 * Retrieves cached availability data from localStorage.
 * @returns A promise that resolves to the cached availability data, or rejects if cache is invalid.
 */
function getAvailabilityFromCache(): Promise<AvailableDownloadLinks> {
  const availabilityStr = localStorage.getItem(
    DOWNLOAD_LINKS_AVAILABILITY_CACHE_KEY
  );
  if (!availabilityStr) {
    return Promise.reject(new Error("Couldn't read cache"));
  }
  try {
    const availability: AvailableDownloadLinks = JSON.parse(availabilityStr);
    return Promise.resolve(availability);
  } catch {
    return Promise.reject(new Error("Invalid cache format"));
  }
}

function cacheAvailability(availability: AvailableDownloadLinks) {
  const availabilityWithTimestamp = {
    ...availability,
    cachedAt: Date.now(),
  };
  const availabilityStr = JSON.stringify(availabilityWithTimestamp);
  localStorage.setItem(DOWNLOAD_LINKS_AVAILABILITY_CACHE_KEY, availabilityStr);
}

/**
 * Checks if valid cached availability data exists.
 * Validates cache age.
 * @returns True if valid cache exists, false otherwise.
 */
function checkIfValidAvailabilityInCache() {
  const availabilityStr = localStorage.getItem(
    DOWNLOAD_LINKS_AVAILABILITY_CACHE_KEY
  );
  if (!availabilityStr) {
    return false;
  }
  try {
    const availability: AvailableDownloadLinks = JSON.parse(availabilityStr);
    if (
      availability.cachedAt &&
      Date.now() - availability.cachedAt > CACHE_MAX_AGE
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches the download links availability state from the API and caches the result.
 * @returns A promise that resolves to the fetched availability data.
 */
export async function fetchDownloadLinksAvailability(): Promise<AvailableDownloadLinks> {
  const response = await api.get<AvailableDownloadLinks>(
    "/waste-collection/download-links-availability"
  );
  const data = response.data;
  cacheAvailability(data);
  return data;
}
