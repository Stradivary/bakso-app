import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  useEffect(() => {
    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return { location };
};
