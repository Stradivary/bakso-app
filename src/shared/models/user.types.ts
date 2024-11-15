export interface User {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  role: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
}



export interface Location {
  latitude: number;
  longitude: number;
}

export interface NearbyUser extends User {
  distance: number;
  last_seen: string;
  is_active: boolean;
  queue_count?: number;
}

export interface SearchParams extends Location {
  radiusMeters: number;
  maxResults?: number;
  minRating?: number;
  activeWithinMinutes?: number;
}

export class UserServiceError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "UserServiceError";
  }
}