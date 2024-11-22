import { RealtimeChannel } from "@supabase/supabase-js";
import { LatLng } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "./useNotification";
import { filterNearbyUsers } from "@/shared/utils/filterNearbyUsers";
import { createPingPayload } from "@/shared/utils/createPingPayload";
import { calculateRegion } from "@/shared/utils/calculateRegion";
import { initSupabaseChannel } from "@/viewmodels/services/trackerServices";
import { UserPayload } from "@/models/user.types";

export const useTracker = (
  userId: string,
  userRole: "seller" | "buyer",
  initialLocation: LatLng | null,
  userName: string,
) => {
  const [nearbyUsers, setNearbyUsers] = useState<UserPayload[]>([]);
  const { notifications, markAsRead, addNotification } =
    useNotifications(userId);

  const regionRef = useRef<string>("");
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleUnsubscribe = useCallback(() => {
    channelRef.current?.untrack();
    channelRef.current?.unsubscribe();
  }, []);

  const handlePresenceSync = useCallback(
    (users: UserPayload[]) => {
      if (!initialLocation) return users;
      const filteredUsers = filterNearbyUsers(
        users,
        initialLocation,
        userRole,
        userId,
      );
      setNearbyUsers(filteredUsers);
    },
    [userRole, userId, initialLocation],
  );

  // Function to handle receiving pings (for sellers)
  const handlePing = useCallback(
    (buyerId: string, buyerName: string) => {
      const notification = createPingPayload({
        buyer_id: buyerId,
        buyer_name: buyerName,
        user_id: userId,
      });
      addNotification(notification);
    },
    [userId, addNotification],
  );

  // Function to send pings (for buyers)
  const sendPing = useCallback(
    (sellerId: string) => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "ping",
          payload: {
            seller_id: sellerId,
            buyer_id: userId,
            buyer_name: userName,
          },
        });
      }
    },
    [userId, userName],
  );

  const handleLocationUpdate = useCallback(
    (userId: string, location: LatLng) => {
      setNearbyUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, location } : user)),
      );
    },
    [],
  );

  useEffect(() => {
    if (!initialLocation) return;
    const region = calculateRegion(initialLocation.lat, initialLocation.lng);
    regionRef.current = region;
    initSupabaseChannel(
      initialLocation,
      region,
      {
        userId,
        userRole,
        userName,
      },
      {
        handleLocationUpdate,
        handlePing,
        handlePresenceSync,
      },
    ).then((channel) => {
      channelRef.current = channel;
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [
    userId,
    userRole,
    userName,
    initialLocation,
    handlePresenceSync,
    handlePing,
    handleLocationUpdate,
  ]);

  return {
    nearbyUsers,
    sendPing,
    handleLocationUpdate,
    notifications,
    markAsRead,
    deactivateUser: handleUnsubscribe,
  };
};
