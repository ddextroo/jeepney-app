import { haversine, metersBetween, pathLengthKm, walkMinutes } from './geo';
import type { LatLng, ResolvedRoute, Stop } from './types';

/**
 * Planning model for a door-to-door jeepney journey.
 * NOTE: these are static-data estimates. The app has no vehicle tracking, so
 * "riding" time comes from corridor length at an assumed average speed and
 * live vehicle positions are never implied.
 */

/** Average jeepney corridor speed used for planning estimates (km/h). */
export const JEEPNEY_KMH = 22;

export type JourneyStage = {
  kind: 'walk' | 'ride';
  distanceMeters: number;
  minutes: number;
  /** Where the stage takes you, e.g. "to Ayala Center" / "to ride 143". */
  toLabel: string;
  /** Boarding / alighting stop for ride stages. */
  stop?: Stop;
};

export type Journey = {
  stages: JourneyStage[];
  totalMeters: number;
  totalMinutes: number;
  board: Stop;
  alight: Stop;
};

/** Ride-stage geometry (boarding → alighting) along the route corridor. */
export function rideSegment(route: ResolvedRoute, boardId: string, alightId: string): { stops: Stop[]; path: LatLng[] } | null {
  const from = route.stops.findIndex((s) => s.id === boardId);
  const to = route.stops.findIndex((s) => s.id === alightId);
  if (from === -1 || to === -1 || from === to) return null;
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  const stops = route.stops.slice(start, end + 1);
  const path: LatLng[] = stops.map((s) => [s.lat, s.lng] as const);
  return { stops, path };
}

/** Build the walk → ride → walk stage plan for a journey. */
export function buildJourney(route: ResolvedRoute, user: { lat: number; lng: number }, boardId: string, alightId: string): Journey | null {
  const seg = rideSegment(route, boardId, alightId);
  if (!seg) return null;
  const board = seg.stops[0];
  const alight = seg.stops[seg.stops.length - 1];

  const walkToMeters = metersBetween(user, board);
  const rideMeters = pathLengthKm(seg.path) * 1000;
  const destination = route.stops[route.stops.length - 1];
  const walkFromMeters = alight.id === destination.id ? 0 : haversine([alight.lat, alight.lng], [destination.lat, destination.lng]);

  const stages: JourneyStage[] = [];
  if (walkToMeters > 20) {
    stages.push({ kind: 'walk', distanceMeters: walkToMeters, minutes: walkMinutes(walkToMeters), toLabel: `to ride ${route.code}` });
  }
  stages.push({ kind: 'ride', distanceMeters: rideMeters, minutes: Math.max(1, Math.round((rideMeters / JEEPNEY_KMH) * 60)), toLabel: `towards ${destination.shortName ?? destination.name}`, stop: board });
  if (walkFromMeters > 20) {
    stages.push({ kind: 'walk', distanceMeters: walkFromMeters, minutes: walkMinutes(walkFromMeters), toLabel: `to ${destination.shortName ?? destination.name}` });
  }

  return {
    stages,
    totalMeters: stages.reduce((sum, s) => sum + s.distanceMeters, 0),
    totalMinutes: Math.max(1, stages.reduce((sum, s) => sum + s.minutes, 0)),
    board,
    alight,
  };
}

/** "1:40"-style clock label `minutes` from now. */
export function arrivalLabel(minutes: number, from: Date = new Date()): string {
  const t = new Date(from.getTime() + minutes * 60_000);
  let h = t.getHours() % 12;
  if (h === 0) h = 12;
  const m = t.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
