export interface PlacePreview {
  xid: string;
  name: string;
  dist?: number;
  rate?: number;
  kinds?: string;
  point: { lon: number; lat: number };
}

export interface PlaceDetails {
  xid: string;
  name: string;
  kinds: string;
  rate?: number;
  point: { lon: number; lat: number };
  address?: {
    city?: string;
    road?: string;
    country?: string;
    house_number?: string;
    postcode?: string;
  };
  preview?: {
    source: string;
    height: number;
    width: number;
  };
  wikipedia_extracts?: {
    title: string;
    text: string;
  };
  url?: string;
  image?: string;
}

export interface SearchParams {
  query?: string;
  lat?: number;
  lon?: number;
  radius?: number;
  kinds?: string;
  limit?: number;
}
