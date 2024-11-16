import { useEffect } from "react";
import { LatLng } from "leaflet";
import { useLocation } from "./useLocation";

export const UPDATE_INTERVAL = 2000;

export function useLocationUpdater({
  disabled,
  userId,
  userRole,
  updateLocation,
}: {
  disabled: boolean;
  userId: string;
  userRole: string;
  updateLocation: (userId: string, location: LatLng) => void;
}) {
  const { location } = useLocation();

  useEffect(() => {
    if (userRole !== "seller" || disabled) {
      return;
    }

    const updateInterval = setInterval(() => {
      updateLocation(
        userId,
        new LatLng(location?.latitude ?? 0, location?.longitude ?? 0),
      );
    }, UPDATE_INTERVAL);

    return () => clearInterval(updateInterval);
  }, [
    userRole,
    updateLocation,
    location?.latitude,
    location?.longitude,
    disabled,
    userId,
  ]);

  return location;
}
