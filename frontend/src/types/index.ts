export interface Feature {
  id: number;
  name: string;
  wkt: string;
  geometry: any;
  photos?: string[];
  type?: string;
}

export interface FeatureCreateDto {
  name: string;
  wkt: string;
  type?: string;
}

export interface FeatureUpdateDto {
  name: string;
  wkt: string;
  type?: string;
}

export interface FeatureReadDto {
  id: number;
  name: string;
  wkt: string;
  geometry: any;
  photos?: string[];
  type?: string;
}

 

export interface Paged<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface MapFeature {
  id: number;
  name: string;
  wkt: string;
  coordinates: [number, number];
}


