import type { LatLng } from './types';

const EARTH_RADIUS_M = 6371000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in meters between two [lat, lng] points. */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  return haversine([a.lat, a.lng], [b.lat, b.lng]);
}

/** Approximate total length of a polyline in kilometers. */
export function pathLengthKm(path: LatLng[]): number {
  let meters = 0;
  for (let i = 1; i < path.length; i++) meters += haversine(path[i - 1], path[i]);
  return meters / 1000;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Walking ETA in minutes at ~ 1.2 m/s. */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 1.2 / 60));
}
