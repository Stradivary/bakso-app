import { RealtimeChannel } from "@supabase/supabase-js";
import { LatLng } from "leaflet";
import { supabase } from "../services/supabaseService";
import { UserPayload } from "@/data/models/user.types";

export const initSupabaseChannel = async (
  location: LatLng,
  region: string,
  user: {
    userId: string;
    userRole: "seller" | "buyer";
    userName: string;
  },
  handlers: {
    handlePresenceSync: (users: UserPayload[]) => void;
    handlePing: (buyerId: string, buyerName: string) => void;
    handleLocationUpdate: (userId: string, location: LatLng) => void;
  },
): Promise<RealtimeChannel> => {
  const channel = supabase.channel(`${region}`, {
    config: { presence: { key: user.userId } },
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState<UserPayload>();
    const users = Object.values(state).flat();
    handlers.handlePresenceSync(users);
  });

  channel.on("broadcast", { event: "location" }, (payload) => {
    const { user_id, location } = payload.payload;
    handlers.handleLocationUpdate(user_id, location);
  });

  channel.on("broadcast", { event: "ping" }, (payload) => {
    const { seller_id, buyer_name, buyer_id } = payload.payload;
    if (seller_id === user.userId) {
      handlers.handlePing(buyer_id, buyer_name);
    }
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
