import api from "./axios";
import type {
  StreetZoneMapping,
  StreetCoordinatesData,
} from "../types/streetZones";
import {
  CACHE_MAX_AGE,
  STREET_ZONE_MAPPING_CACHE_KEY,
  STREET_COORDINATES_MAPPING_CACHE_KEY,
} from "./wasteAPI";

/**
 * Retrieves the street-to-zone mapping cdata.
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
  if (!mappingStr) {
    return Promise.reject(new Error("Couldn't read cache"));
  }
  try {
    const mapping: StreetZoneMapping = JSON.parse(mappingStr);
    return Promise.resolve(mapping);
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
  if (!mappingStr) {
    return false;
  }
  try {
    const mapping: StreetZoneMapping = JSON.parse(mappingStr);
    if (mapping.cachedAt && Date.now() - mapping.cachedAt > CACHE_MAX_AGE) {
      return false;
    }
    return true;
  } catch {
    return false;
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

/**
 * Retrieves the street coordinates mapping data.
 * Uses caching to avoid unnecessary API calls.
 * @returns A promise that resolves to the street coordinates data.
 */
export async function getStreetCoordinatesMapping(): Promise<StreetCoordinatesData> {
  if (checkIfValidStreetCoordinatesMappingInCache()) {
    return getStreetCoordinatesMappingFromCache();
  }
  return await fetchStreetCoordinatesMapping();
}

/**
 * Retrieves cached street coordinates mapping from localStorage.
 * @returns A promise that resolves to the cached coordinates data, or rejects if cache is invalid.
 */
function getStreetCoordinatesMappingFromCache(): Promise<StreetCoordinatesData> {
  const mappingStr = localStorage.getItem(STREET_COORDINATES_MAPPING_CACHE_KEY);
  if (!mappingStr) {
    return Promise.reject(new Error("Couldn't read cache"));
  }
  try {
    const mapping: StreetCoordinatesData = JSON.parse(mappingStr);
    return Promise.resolve(mapping);
  } catch {
    return Promise.reject(new Error("Invalid cache format"));
  }
}

function cacheStreetCoordinatesMapping(mapping: StreetCoordinatesData) {
  const mappingWithTimestamp = { ...mapping, cacheAt: Date.now() };
  const mappingStr = JSON.stringify(mappingWithTimestamp);
  localStorage.setItem(STREET_COORDINATES_MAPPING_CACHE_KEY, mappingStr);
}

/**
 * Checks if valid cached street coordinates mapping exists.
 * Validates cache age.
 * @returns True if valid cache exists, false otherwise.
 */
function checkIfValidStreetCoordinatesMappingInCache() {
  const mappingStr = localStorage.getItem(STREET_COORDINATES_MAPPING_CACHE_KEY);
  if (!mappingStr) {
    return false;
  }
  try {
    const mapping: StreetCoordinatesData = JSON.parse(mappingStr);
    if (mapping.cacheAt && Date.now() - mapping.cacheAt > CACHE_MAX_AGE) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches the street coordinates mapping from the API and caches the result.
 * @returns A promise that resolves to the fetched coordinates data.
 */
async function fetchStreetCoordinatesMapping(): Promise<StreetCoordinatesData> {
  const response = await api.get<StreetCoordinatesData>(
    `/waste-collection/street-coordinates-mapping`
  );
  const data = response.data;
  cacheStreetCoordinatesMapping(data);
  return data;
}
