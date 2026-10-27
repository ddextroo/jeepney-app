import type { LatLng } from '@/data';

export type Bounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

export function boundsOf(points: LatLng[]): Bounds {
  if (points.length === 0) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
  let minLat = points[0][0];
  let maxLat = points[0][0];
  let minLng = points[0][1];
  let maxLng = points[0][1];
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return { minLat, maxLat, minLng, maxLng };
}

export type Projector = (lat: number, lng: number) => { x: number; y: number };

/**
 * Build an equirectangular projector that maps lat/lng into a width×height box,
 * preserving aspect ratio and centering the bounds with padding.
 */
export function makeProjector(bounds: Bounds, width: number, height: number, padding = 40): Projector {
  const spanLat = Math.max(0.0001, bounds.maxLat - bounds.minLat);
  const spanLng = Math.max(0.0001, bounds.maxLng - bounds.minLng);
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const scale = Math.min(innerW / spanLng, innerH / spanLat);

  const offsetX = padding + (innerW - spanLng * scale) / 2;
  const offsetY = padding + (innerH - spanLat * scale) / 2;

  return (lat, lng) => ({
    x: offsetX + (lng - bounds.minLng) * scale,
    // Latitude increases northward; screen y increases downward.
    y: offsetY + (bounds.maxLat - lat) * scale,
  });
}
