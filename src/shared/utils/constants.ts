export const SEARCH_PARAMS = {
  radiusMeters: 1000, // 1 km radius
  maxResults: 50,
  minRating: 0,
  activeWithinMinutes: 15,
};

export const LOCATION_UPDATE_INTERVAL = 10 * 1000; // 30 seconds

export const BASE_ROUTING_URL =
  "https://routing.openstreetmap.de/routed-foot/route/v1/driving";

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://tfqnagzgyzfspmbladso.supabase.co";

export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
