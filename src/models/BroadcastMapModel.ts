export interface User {
  user_id: string;
  display_name: string;
  role: "seller" | "buyer";
  location: {
    lat: number;
    lng: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
}
