import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

/** IT Park, Cebu City — used when real location is unavailable so the demo always has data. */
export const CEBU_FALLBACK = { lat: 10.3215, lng: 123.9018 } as const;

export type UserLocation = {
  lat: number;
  lng: number;
  /** True when this is the real device location, false when it is the fallback. */
  isPrecise: boolean;
  loading: boolean;
  refresh: () => void;
};

/**
 * Requests location permission and tracks the user's position, falling back to
 * a central Cebu coordinate when permission is denied or unavailable (e.g. web).
 */
export function useUserLocation(): UserLocation {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(CEBU_FALLBACK);
  const [isPrecise, setIsPrecise] = useState(false);
  const [loading, setLoading] = useState(true);

  const locate = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCoords(CEBU_FALLBACK);
        setIsPrecise(false);
        return;
      }
      const position = await Location.getLastKnownPositionAsync({ maxAge: 1000 * 60 * 10 });
      const current = position ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      setCoords({ lat: current.coords.latitude, lng: current.coords.longitude });
      setIsPrecise(true);
    } catch {
      setCoords(CEBU_FALLBACK);
      setIsPrecise(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Syncing an external async system (geolocation); setState runs after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    locate();
  }, [locate]);

  return { ...coords, isPrecise, loading, refresh: locate };
}
