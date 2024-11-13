import { useState, useEffect } from "react";

export const useLocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }, () => {
      console.log("error getting position")
    }, {
      enableHighAccuracy: true,
      maximumAge: 360000,
      timeout: 5000
    });
 
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location };
};
