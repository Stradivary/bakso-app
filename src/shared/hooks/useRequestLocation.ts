// useRequestLocation.ts
import { useState } from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

export const useRequestLocation = () => {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Browser anda tidak mendukung geolocation",
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          isLoading: false,
        }));
      },
      (error) => {
        setState({
          latitude: null,
          longitude: null,
          error: error.message,
          isLoading: false,
        });
      },
    );
  };

  return { ...state, requestLocation };
};
