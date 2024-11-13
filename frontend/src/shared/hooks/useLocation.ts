import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

interface UseLocationOptions {
  autoUpdate?: boolean;
  updateInterval?: number;
}

export const useLocation = (options?: UseLocationOptions) => {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: "Browser anda tidak mendukung geolocation",
        isLoading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(prev => ({
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
      }
    );
  }, []);

  useEffect(() => {
    let watchId: number | null = null;

    if (options?.autoUpdate) {
      if (navigator.geolocation) {
        setState(prev => ({ ...prev, isLoading: true }));
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setState(prev => ({
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
          {
            maximumAge: options.updateInterval || 300000,
            timeout: 5000,
            enableHighAccuracy: true,
          }
        );
      } else {
        setState(prev => ({
          ...prev,
          error: "Browser anda tidak mendukung geolocation",
          isLoading: false,
        }));
      }
    } else {
      if (!navigator.geolocation) {
        setState(prev => ({
          ...prev,
          error: "Browser anda tidak mendukung geolocation",
          isLoading: false,
        }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState(prev => ({
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
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [options?.autoUpdate, options?.updateInterval, requestLocation]);

  return { ...state, requestLocation };
};
