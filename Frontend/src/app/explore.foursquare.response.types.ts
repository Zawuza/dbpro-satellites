export interface Meta {
  code: number;
  requestId: string;
}

export interface Ne {
  lat: number;
  lng: number;
}

export interface Sw {
  lat: number;
  lng: number;
}

export interface SuggestedBounds {
  ne: Ne;
  sw: Sw;
}

export interface Item2 {
  summary: string;
  type: string;
  reasonName: string;
}

export interface Reasons {
  count: number;
  items: Item2[];
}

export interface LabeledLatLng {
  label: string;
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  crossStreet: string;
  lat: number;
  lng: number;
  labeledLatLngs: LabeledLatLng[];
  distance: number;
  postalCode: string;
  cc: string;
  city: string;
  state: string;
  country: string;
  formattedAddress: string[];
  neighborhood: string;
}

export interface Icon {
  prefix: string;
  suffix: string;
}

export interface Category {
  id: string;
  name: string;
  pluralName: string;
  shortName: string;
  icon: Icon;
  primary: boolean;
}

export interface Photos {
  count: number;
  groups: any[];
}

export interface VenuePage {
  id: string;
}

export interface Venue {
  id: string;
  name: string;
  location: Location;
  categories: Category[];
  photos: Photos;
  venuePage: VenuePage;
  img: string;
}

export interface Item {
  reasons: Reasons;
  venue: Venue;
  referralId: string;
}

export interface Group {
  type: string;
  name: string;
  items: Item[];
}

export interface Response {
  headerLocation: string;
  headerFullLocation: string;
  headerLocationGranularity: string;
  totalResults: number;
  suggestedBounds: SuggestedBounds;
  groups: Group[];
}

export interface ExploreResponse {
  meta: Meta;
  response: Response;
}



