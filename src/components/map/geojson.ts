import type { LatLng, ResolvedRoute, Stop } from '@/data';
import { palette, SELECTED_ROUTE_COLOR } from '@/theme';

/**
 * Dark, detailed navigation-style cartography (deep charcoal/navy base,
 * graded road hierarchy, muted labels). Swap in a custom Studio style URL
 * here to fine-tune without touching rendering code.
 */
export const MAP_STYLE_URL = 'mapbox://styles/mapbox/dark-v11';

export type Feature = {
  type: 'Feature';
  properties: Record<string, unknown>;
  geometry: { type: 'LineString' | 'Point'; coordinates: [number, number][] | [number, number] };
};
export type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] };

const toLngLat = (p: LatLng): [number, number] => [p[1], p[0]];

export function routeFeatureCollection(routes: ResolvedRoute[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: routes.map((r) => ({
      type: 'Feature',
      properties: { id: r.id, color: r.color },
      geometry: { type: 'LineString', coordinates: r.path.map(toLngLat) },
    })),
  };
}

export function stopsFeatureCollection(stops: Stop[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: stops.map((s) => ({
      type: 'Feature',
      properties: { id: s.id, name: s.name },
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
    })),
  };
}

/** GeoJSON bounds [westLng, southLat, eastLng, northLat] for a route, for fitBounds. */
export function routeBounds(route: ResolvedRoute): [number, number, number, number] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lat, lng] of route.path) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return [minLng, minLat, maxLng, maxLat];
}

/** Paint model for a route line, given the current selection / mode. */
export type RoutePaint = {
  /** Bright line color (dimmed gray when inactive). */
  color: string;
  haloColor: string;
  haloWidth: number;
  lineWidth: number;
  opacity: number;
  /** Show the white dashed centerline (active guidance only). */
  dashed: boolean;
};

export function routePaint(route: ResolvedRoute, selectedRouteId?: string | null, mode: 'explore' | 'navigation' = 'explore'): RoutePaint {
  const isSelected = route.id === selectedRouteId;
  if (!selectedRouteId) {
    // Nothing selected yet — every corridor reads as a thin, muted line.
    return { color: route.color, haloColor: palette.mapHalo, haloWidth: 4, lineWidth: 2.5, opacity: 0.8, dashed: false };
  }
  if (isSelected) {
    const active = mode === 'navigation';
    return {
      color: SELECTED_ROUTE_COLOR,
      haloColor: palette.mapHalo,
      haloWidth: active ? 12 : 9,
      lineWidth: active ? 7 : 5,
      opacity: 1,
      dashed: active,
    };
  }
  return { color: palette.mapInactiveRoute, haloColor: palette.mapHalo, haloWidth: 4, lineWidth: 2, opacity: 0.3, dashed: false };
}
