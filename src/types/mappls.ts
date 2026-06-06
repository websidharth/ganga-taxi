export type MapplsSuggestion = {
  eLoc: string;
  placeName: string;
  placeAddress: string;
  latitude?: number | string;
  longitude?: number | string;
  type?: string;
  distance?: number;
};

export type SelectedPlace = {
  eLoc: string;
  placeName: string;
  placeAddress: string;
  latitude?: number;
  longitude?: number;
};

export type RouteApiResponse = {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry:
      | string
      | {
          coordinates: [number, number][];
          type: string;
        };
  }>;
};

