export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'customer' | 'seller';
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number;
}
