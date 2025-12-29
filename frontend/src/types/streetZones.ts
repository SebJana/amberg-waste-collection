export type StreetZoneMapping = Record<string, string> & {
  cachedAt?: number;
};

export type Coordinate = [number, number];

export type StreetWithCoordinates = {
  name: string;
  coords: Coordinate[];
  zone: string;
};

export type StreetCoordinatesData = {
  streets: StreetWithCoordinates[];
  cacheAt?: number;
};
