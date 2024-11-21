import { LatLng } from "leaflet";
import { useEffect } from "react";
import { useRequestLocation } from "./useRequestLocation";

export const UPDATE_INTERVAL = 2000;

export function useLocationUpdater({
  userId,
  userRole,
  updateLocation,
}: {
  userId: string;
  userRole: string;
  updateLocation: (userId: string, location: LatLng) => void;
}) {
  const { latitude, longitude, isLoading, requestLocation } = useRequestLocation();
  useEffect(() => {
    if (isLoading) return;
    updateLocation(
      userId,
      new LatLng(latitude ?? 0, longitude ?? 0),
    );
  }, [latitude, longitude, isLoading])
  useEffect(() => {
    if (userRole !== "seller") {
      return;
    }

    const updateInterval = setInterval(() => {
      requestLocation();
    }, UPDATE_INTERVAL);

    return () => clearInterval(updateInterval);
  }, [
    userRole,
    updateLocation,
    requestLocation,
    isLoading,
    userId,
  ]);

  return location;
}
