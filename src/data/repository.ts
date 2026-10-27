import { getStop } from './stops';
import { ROUTES } from './routes';
import type { LatLng, ResolvedRoute, Stop } from './types';

/** All routes resolved with their stop objects and polyline paths. */
export const RESOLVED_ROUTES: ResolvedRoute[] = ROUTES.map((route) => {
  const stops: Stop[] = route.stopIds.map(getStop);
  const path: LatLng[] = stops.map((s) => [s.lat, s.lng] as const);
  return { ...route, stops, path };
});

const ROUTE_BY_ID = new Map(RESOLVED_ROUTES.map((r) => [r.id, r]));

/** stopId -> routeIds that serve it. */
const ROUTE_IDS_BY_STOP = new Map<string, string[]>();
for (const route of RESOLVED_ROUTES) {
  for (const stop of route.stops) {
    const list = ROUTE_IDS_BY_STOP.get(stop.id) ?? [];
    if (!list.includes(route.id)) list.push(route.id);
    ROUTE_IDS_BY_STOP.set(stop.id, list);
  }
}

export function getRoute(id: string): ResolvedRoute | undefined {
  return ROUTE_BY_ID.get(id);
}

export function routeIdsForStop(stopId: string): string[] {
  return ROUTE_IDS_BY_STOP.get(stopId) ?? [];
}

export function routesForStop(stopId: string): ResolvedRoute[] {
  return routeIdsForStop(stopId)
    .map((id) => ROUTE_BY_ID.get(id))
    .filter((r): r is ResolvedRoute => Boolean(r));
}

/** Every stop that appears in at least one route. */
export const SERVED_STOPS: Stop[] = [...ROUTE_IDS_BY_STOP.keys()].map(getStop);
