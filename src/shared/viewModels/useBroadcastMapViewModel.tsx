import { Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications as notify } from "@mantine/notifications";
import L, { LatLng } from "leaflet";
import React, { useCallback, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "../hooks/useLocation";
import { useTracker } from "../hooks/useTracker";
import { User } from "../models/BroadcastMapModel";
import { calculateDistance } from "../services/trackerServices";

export const useBroadcastMapViewModel = () => {
  const { session, logout } = useAuth();
  const userId = session?.user?.id as string;
  const userName = session?.user?.user_metadata?.name;
  const userRole = sessionStorage.getItem("abangbakso-role") as
    | "seller"
    | "buyer";
  const [exitModalOpened, { close: exitModalClose, open: openModal }] =
    useDisclosure();
  const [lastValidLatLng, setLastValidLatLng] = useState<LatLng | null>(null);

  const { location } = useLocation();

  const fixedLocation = useMemo(() => {
    if (!location?.latitude || !location?.longitude) {
      return lastValidLatLng;
    }
    const LatLng = new L.LatLng(location?.latitude, location?.longitude);
    setLastValidLatLng(LatLng);
    return LatLng;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.latitude, location?.longitude]);

  const {
    nearbyUsers,
    handleLocationUpdate,
    handlePing,
    notifications,
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
      const newLocation = [location?.latitude || 0, location?.longitude || 0];
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
    (
      nearbyUser: User,
      location: { latitude: number; longitude: number },
      handlePing: (buyerId: string, buyerName: string) => void,
    ) => {
      console.log("hehe");
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

        modals.openConfirmModal({
          title: "Pesan Bakso",
          children: (
            <Stack gap={4}>
              <Text size="sm">
                🍜 Apakah Anda ingin memesan bakso dari {nearbyUser.userName}?
              </Text>
              <Text size="xs" c="dimmed">
                Estimasi waktu: {estimatedTimeInMinutes} menit berjalan kaki
              </Text>
            </Stack>
          ),
          labels: { cancel: "Batal", confirm: "Pesan" },
          onConfirm: () => {
            handlePing?.(nearbyUser.user_id, nearbyUser.userName);
            notify.show({
              title: "Pesan Bakso",
              message: "Pesan bakso telah dikirim",
              color: "blue",
            });
          },
        });
      }
    },
    [],
  );

  const centerLocation = useMemo(
    () => new L.LatLng(location?.latitude || 0, location?.longitude || 0),
    [location],
  );

  return {
    userId,
    userName,
    session,
    userRole,
    location,
    nearbyUsers,
    handleLocationUpdate,
    handlePing,
    notifications,
    exitModalOpened,
    openModal,
    exitModalClose,
    handleRecenter,
    handleExit,
    handleMarkerClick,
    setMapRef,
    centerLocation,
  };
};
