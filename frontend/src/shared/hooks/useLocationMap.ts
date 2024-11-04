import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../models/location-map.types";
import type { NearbyUser } from "../models/user.types";
import { supabase } from "../services/supabaseService";
import { userService } from "../services/userService";
import { LOCATION_UPDATE_INTERVAL, SEARCH_PARAMS } from "../utils/constants";

export const useLocationMap = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // Memoize static values
  const currentUser = useMemo(() => 
    JSON.parse(sessionStorage.getItem("user") ?? "{}") as NearbyUser,
    []
  );
  
  const userRole = useMemo(() => 
    sessionStorage.getItem("role") as UserRole,
    []
  );
  
  const counterpartRole = useMemo(() => 
    userRole === "customer" ? "seller" : "buyer",
    [userRole]
  );

  // Memoize functions
  const updateLocationAndFetchUsers = useCallback(async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      await userService.updateLocation({ latitude, longitude });
      const nearbyCounterparts = await userService.findNearbyCounterparts({
        latitude,
        longitude,
        ...SEARCH_PARAMS,
      });
      setNearbyUsers(nearbyCounterparts);
      setError(null);
    } catch (err) {
      console.error("Error updating location or fetching users:", err);
      setError((err as Error).message);
    }
  }, []); // No dependencies needed as it only uses external services and setState

  const handleExit = useCallback(async () => {
    try {
      await userService.deactivateUser();
      navigate("/auth");
    } catch (err) {
      console.error("Error deactivating user:", err);
      navigate("/auth");
    }
  }, [navigate]);

  const refreshUsers = useCallback(async () => {
    if (position) {
      setIsLoading(true);
      try {
        await updateLocationAndFetchUsers(position[0], position[1]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [position, updateLocationAndFetchUsers]);

  // Location initialization effect
  useEffect(() => {
    let locationWatcher: number;
    let locationInterval: NodeJS.Timeout;

    const initializeLocation = async () => {
      try {
        setIsLoading(true);
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 10000,
            });
          },
        );

        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);
        await updateLocationAndFetchUsers(latitude, longitude);

        locationWatcher = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setPosition([latitude, longitude]);
            await updateLocationAndFetchUsers(latitude, longitude);
          },
          (error) => {
            console.error("Location watch error:", error);
            setError(
              "Unable to track location. Please ensure location services are enabled.",
            );
          },
          { enableHighAccuracy: true },
        );

        locationInterval = setInterval(async () => {
          if (position) {
            const { latitude, longitude } = position.coords;
            await updateLocationAndFetchUsers(latitude, longitude);
          }
        }, LOCATION_UPDATE_INTERVAL);
      } catch (err) {
        console.error("Error initializing location:", err);
        setError("Please enable location services to use this app.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocation();

    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
      }
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [updateLocationAndFetchUsers]); // Added dependency

  // Supabase subscription effect
  useEffect(() => {
    if (!position) return;

    const channel = supabase.channel("public:users");
    
    const subscription = channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `role=eq.${counterpartRole}`,
        },
        async (payload) => {
          try {
            console.log('Received update:', payload);
            await updateLocationAndFetchUsers(position[0], position[1]);
          } catch (error) {
            console.error('Error handling user update:', error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to users changes');
        } else if (status === 'CLOSED') {
          console.log('Subscription closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to channel');
        }
      });

    return () => {
      subscription.unsubscribe().catch(error => {
        console.error('Error unsubscribing:', error);
      });
      channel.unsubscribe().catch(error => {
        console.error('Error unsubscribing:', error);
      });
    };
  }, [position, counterpartRole, updateLocationAndFetchUsers]);

  return {
    opened,
    open,
    close,
    position,
    currentUser,
    nearbyUsers,
    isLoading,
    error,
    userRole,
    refreshUsers,
    handleExit,
  };
};