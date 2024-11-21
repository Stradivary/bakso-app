import { User } from "@/models/BroadcastMapModel";
import { calculateDistance } from "@/viewmodels/hooks/calculateDistance";
import { useTracker } from "@/viewmodels/hooks/useTracker";
import { useAuth } from "@/views/providers/authProvider";
import { useDisclosure } from "@mantine/hooks";
import L, { LatLng } from "leaflet";
import React, { useCallback, useMemo, useState } from "react";

export const useBroadcastMapViewModel = (
  location: {
    latitude: number;
    longitude: number;
  } | null,
) => {
  const { session, logout } = useAuth();
  const userId = session?.user?.id as string;
  const userName = session?.user?.user_metadata?.display_name;
  const userRole = session?.user?.user_metadata?.role as "seller" | "buyer";
  const userLocation = [
    session?.user?.user_metadata?.latitude,
    session?.user?.user_metadata?.longitude,
  ];
  const [exitModalOpened, { close: exitModalClose, open: openModal }] =
    useDisclosure();
  const [lastValidLatLng, setLastValidLatLng] = useState<LatLng | null>(null);

  const fixedLocation = useMemo<LatLng>(() => {
    if (userRole === "buyer") {
      return new L.LatLng(userLocation[0], userLocation[1]);
    }

    if (!location?.latitude || (!location?.longitude && lastValidLatLng)) {
      return lastValidLatLng ?? new L.LatLng(0, 0);
    }

    const LatLng = new L.LatLng(location?.latitude, location?.longitude);

    setLastValidLatLng(LatLng);

    return LatLng;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.latitude, location?.longitude]);

  const {
    nearbyUsers,
    sendPing,
    notifications,
    handleLocationUpdate,
    deactivateUser,
  } = useTracker(
    userId,
    userRole,
    fixedLocation,
    session?.user?.user_metadata?.name ?? "",
  );

  const [mapRef, setMapRef] = React.useState<L.Map | null>(null);

  const handleRecenter = React.useCallback(() => {
    if (mapRef && location) {
      const newLocation = [location?.latitude ?? 0, location?.longitude ?? 0];
      mapRef.setView(
        new L.LatLng(newLocation[0], newLocation[1]),
        mapRef.getZoom(),
        {
          animate: true,
          duration: 1,
        },
      );
    }
  }, [mapRef, location]);

  const handleExit = React.useCallback(() => {
    deactivateUser();
    logout();
    exitModalClose();
  }, [deactivateUser, exitModalClose, logout]);

  const handleMarkerClick = useCallback(
    (nearbyUser: User) => {
      if (nearbyUser.role === "seller") {
        const buyerLocation = new L.LatLng(
          location?.latitude ?? 0,
          location?.longitude ?? 0,
        );
        const sellerLocation = new L.LatLng(
          nearbyUser.location.lat,
          nearbyUser.location.lng,
        );
        const distanceInMeters = calculateDistance(
          buyerLocation,
          sellerLocation,
        );
        const walkingSpeed = 1.4; // meters per second
        const estimatedTimeInMinutes = Math.round(
          distanceInMeters / walkingSpeed / 60,
        );

        return {
          nearbyUser,
          estimatedTimeInMinutes,
        };
      }
    },
    [location],
  );

  const centerLocation = useMemo(() => {
    if (userRole === "buyer" && fixedLocation) return fixedLocation;

    return new L.LatLng(location?.latitude ?? 0, location?.longitude ?? 0);
  }, [location]);

  return {
    userId,
    userName,
    session,
    userRole,
    location,
    nearbyUsers,
    handleLocationUpdate,
    notifications,
    exitModalOpened,
    openModal,
    exitModalClose,
    handleRecenter,
    handleExit,
    handleMarkerClick,
    setMapRef,
    fixedLocation,
    centerLocation,
    sendPing,
  };
};
