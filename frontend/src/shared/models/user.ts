export interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
}
