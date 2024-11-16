import {
  calculateRegion,
  filterNearbyUsers,
  initSupabaseChannel,
  User,
} from "@/shared/services/trackerServices";
import { RealtimeChannel } from "@supabase/supabase-js";
import { LatLng } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPingPayload } from "../services/trackerServices";
import { Notification, useNotifications } from "./useNotification";

export const useTracker = (
  userId: string,
  userRole: "seller" | "buyer",
  initialLocation: LatLng,
  userName: string,
) => {
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(
    [],
  );
  const { markAsRead } = useNotifications(userId, localNotifications);

  const regionRef = useRef<string>("");
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleUnsubscribe = useCallback(() => {
    channelRef.current?.untrack();
    channelRef.current?.unsubscribe();
  }, []);

  const handlePresenceSync = useCallback(
    (users: User[]) => {
      const filteredUsers = filterNearbyUsers(
        users,
        initialLocation,
        userRole,
        userId,
      );
      setNearbyUsers(filteredUsers);
    },
    [initialLocation, userRole, userId],
  );

  const handlePing = useCallback(
    (buyerId: string, buyerName: string) => {
      const notification = createPingPayload({
        buyer_id: buyerId,
        buyer_name: buyerName,
        user_id: userId,
      });
      setLocalNotifications((prev) => [...prev, notification]);
      setSelectedSeller(userId);
    },
    [userId],
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
    selectedSeller,
    markAsRead,
    handlePing,
    handleLocationUpdate,
    notifications: localNotifications,
    deactivateUser: handleUnsubscribe,
  };
};
