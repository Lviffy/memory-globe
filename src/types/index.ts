export interface Memory {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  date: string;
  imageUrl: string;
  tags: string[];
}

export interface GlobeConfig {
  altitude: number;
  tilt: number;
  heading: number;
  roll: number;
}