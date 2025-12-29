/**
 * Central barrel file for all waste collection API functions and cache configuration.
 *
 * Cache Settings:
 * - TTL: 5 minutes
 * - Rationale: Server performs no heavy work on frequent requests. Short TTL ensures
 *   clients receive updated data promptly when schedules change (e.g., new year added, street mapping updated, ...).
 *
 * Cache Keys:
 * - Separate keys for each data type (pickups, schedules, street mappings)
 * - Enables independent cache invalidation per data category
 */

// Cache maximum age in milliseconds (5 minutes)
export const CACHE_MAX_AGE = 5 * 60 * 1000;

// Cache keys for localStorage
export const NEXT_PICKUPS_CACHE_KEY = "nextPickups";
export const SCHEDULE_CACHE_KEY = "schedule";
export const STREET_ZONE_MAPPING_CACHE_KEY = "streetZoneMapping";
export const STREET_COORDINATES_MAPPING_CACHE_KEY = "streetCoordinatesMapping";

// API functions
export { getNextPickups, fetchNextPickups } from "./pickupsAPI";
export { getSchedule, fetchSchedule } from "./scheduleAPI";
export {
  getStreetZoneMapping,
  getStreetCoordinatesMapping,
} from "./streetMappingAPI";
