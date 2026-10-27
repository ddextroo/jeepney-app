import { metersBetween } from './geo';
import { RESOLVED_ROUTES, SERVED_STOPS, routeIdsForStop } from './repository';
import type { FareQuote, NearbyStop, ResolvedRoute } from './types';

/** Nearby served stops within `radiusMeters`, sorted by distance. */
export function findNearbyStops(lat: number, lng: number, radiusMeters = 5000): NearbyStop[] {
  return SERVED_STOPS.map((stop) => ({
    ...stop,
    routeIds: routeIdsForStop(stop.id),
    distanceMeters: metersBetween({ lat, lng }, stop),
  }))
    .filter((s) => s.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/** Routes whose corridor passes near a point, ranked by how close the nearest stop is. */
export function routesPassingNear(lat: number, lng: number, radiusMeters = 6000): { route: ResolvedRoute; nearestStop: NearbyStop }[] {
  const nearby = findNearbyStops(lat, lng, radiusMeters);
  const results: { route: ResolvedRoute; nearestStop: NearbyStop }[] = [];
  const seen = new Set<string>();

  for (const stop of nearby) {
    for (const routeId of stop.routeIds) {
      if (seen.has(routeId)) continue;
      const route = RESOLVED_ROUTES.find((r) => r.id === routeId);
      if (!route) continue;
      seen.add(routeId);
      results.push({ route, nearestStop: stop });
    }
  }
  return results.sort((a, b) => a.nearestStop.distanceMeters - b.nearestStop.distanceMeters);
}

/** Free-text match against route code, name, description, and stop names. */
export function matchRoutes(query: string): ResolvedRoute[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return RESOLVED_ROUTES.filter((route) => {
    if (route.code.toLowerCase().includes(q)) return true;
    if (route.name.toLowerCase().includes(q)) return true;
    if (route.description.toLowerCase().includes(q)) return true;
    return route.stops.some((s) => s.name.toLowerCase().includes(q) || s.shortName?.toLowerCase().includes(q));
  });
}

/** Interpolate a fare from hop count between the route's min and max tiers. */
function fareForHops(route: ResolvedRoute, hops: number): number {
  const totalStops = route.stops.length;
  const { min, max } = route.fare;
  if (totalStops <= 2) return max;
  const ratio = Math.min(1, (hops - 1) / (totalStops - 2));
  const fare = min + ratio * (max - min);
  return Math.round(fare);
}

/**
 * Quote a fare for boarding `fromStopId` and alighting `toStopId` on a route.
 * Returns null if either stop is not on the route or the direction is invalid.
 */
export function faresForRoute(route: ResolvedRoute, fromStopId: string, toStopId: string): FareQuote | null {
  const fromIndex = route.stops.findIndex((s) => s.id === fromStopId);
  const toIndex = route.stops.findIndex((s) => s.id === toStopId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return null;

  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  const segment = route.stops.slice(start, end + 1);
  const hops = end - start;
  const from = route.stops[fromIndex];
  const to = route.stops[toIndex];

  // In travel direction, the stop just before alighting is when to start calling "Alang!".
  const announceIndex = toIndex > fromIndex ? toIndex - 1 : toIndex + 1;
  const alightAnnounce = route.stops[announceIndex] ?? to;

  return {
    route,
    from,
    to,
    hops,
    fare: fareForHops(route, hops),
    segment,
    alightAnnounce,
  };
}
