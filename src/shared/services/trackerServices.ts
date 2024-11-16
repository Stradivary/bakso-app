import { LatLng } from "leaflet";
import { supabase } from "../services/supabaseService";
import { RealtimeChannel } from "@supabase/supabase-js";

export const SELLER_RADIUS = 3000; // 3km in meters
export const BUYER_RADIUS = 3000; // 3km in meters
export const PRESENCE_UPDATE_BUFFER = 1000; // 5 seconds

export interface User {
  id: string;
  user_id: string;
  role: "seller" | "buyer";
  location: { lat: number; lng: number };
  isOnline: boolean;
  userName: string;
  isAvailable: boolean;
  seller_id: string;
}

export const calculateRegion = (lat: number, lng: number): string =>
  Buffer.from(`${Math.floor(lat * 10)}-${Math.floor(lng * 10)}`).toString(
    "base64",
  );

export const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const filterNearbyUsers = (
  users: User[],
  currentLocation: LatLng,
  userRole: "seller" | "buyer",
  userId?: string,
): User[] => {
  const adjustDuplicateLocations = (users: User[]) => {
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        if (
          users[i].location.lat === users[j].location.lat &&
          users[i].location.lng === users[j].location.lng
        ) {
          users[j].location.lat += 0.01;
          users[j].location.lng += 0.01;
        }
      }
    }
    return users;
  };

  return adjustDuplicateLocations(users).filter((user) => {
    if (user.id === userId) return false; // Exclude self

    const distance = calculateDistance(
      currentLocation,
      new LatLng(user.location.lat, user.location.lng),
    );

    if (userRole === "buyer") {
      return user.role === "seller" && distance <= BUYER_RADIUS;
    } else if (userRole === "seller") {
      return (
        user.role === "buyer" && distance <= SELLER_RADIUS && user.isAvailable
      );
    }
    return false;
  });
};

export const initSupabaseChannel = async (
  location: LatLng,
  region: string,
  user: {
    userId: string;
    userRole: "seller" | "buyer";
    userName: string;
  },
  handlers: {
    handlePresenceSync: (users: User[]) => void;
    handlePing: (buyerId: string, buyerName: string) => void;
    handleLocationUpdate: (userId: string, location: LatLng) => void;
  },
): Promise<RealtimeChannel> => {
  const channel = supabase.channel(`${region}`, {
    config: { presence: { key: user.userId } },
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState<User>();
    const users = Object.values(state).flat();
    handlers.handlePresenceSync(users);
  });

  channel.on("broadcast", { event: "ping" }, (payload) => {
    const { seller_id, buyer_name, buyer_id } = payload.payload;
    if (seller_id === user.userId) handlers.handlePing(buyer_id, buyer_name);
  });

  channel.on("broadcast", { event: "location" }, (payload) => {
    const { user_id, location } = payload.payload;
    handlers.handleLocationUpdate(user_id, location);
  });

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      channel.track({
        user_id: user.userId,
        role: user.userRole,
        location: { lat: location.lat, lng: location.lng },
        isOnline: true,
        userName: user.userName,
        isAvailable: true,
      });
    }
  });

  return channel;
};

export const createPingPayload = ({
  buyer_id,
  buyer_name,
  user_id,
}: {
  buyer_id: string;
  buyer_name: string;
  user_id: string;
}) => {
  return {
    id: `${buyer_id}-${Date.now()}`,
    buyer_id: buyer_id,
    buyer_name: buyer_name,
    seller_id: user_id,
    is_read: false,
    created_at: new Date().toISOString(),
    expiry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
};
