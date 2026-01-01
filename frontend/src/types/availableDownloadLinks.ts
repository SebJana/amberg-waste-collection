export type AvailabilityMap = {
  [year: number]: {
    [result_type: string]: boolean;
  };
};

export type AvailableDownloadLinks = {
  reference_date: string;
  result_types: string[];
  url_template: {
    template: string;
    parameters: {
      year: number;
      result_type: string;
      zone: string;
    };
  };
  availability: AvailabilityMap;
  cachedAt?: number;
};
