/**
 * Domain types for the Metro Cebu jeepney network.
 */

/** A [latitude, longitude] pair. */
export type LatLng = readonly [number, number];

export type Stop = {
  id: string;
  name: string;
  /** Optional shorter label shown on the map / chips. */
  shortName?: string;
  lat: number;
  lng: number;
};

export type FareTier = {
  /** Minimum fare (peso) — e.g. within the first few hops. */
  min: number;
  /** Maximum fare (peso) — full route. */
  max: number;
};

/** Raw route as authored in routes.ts. */
export type RouteDefinition = {
  id: string;
  /** Public route number, e.g. "143". */
  code: string;
  /** Destination-style name, e.g. "MANSILAY". */
  name: string;
  /** Human corridor description, e.g. "Ayala Center -> Mansilay via Cebu North Road". */
  description: string;
  /** Badge / polyline color. */
  color: string;
  fare: FareTier;
  /** Ordered stop ids along the route. */
  stopIds: string[];
};

/** Route resolved against the stop table (adds stop objects + polyline). */
export type ResolvedRoute = RouteDefinition & {
  stops: Stop[];
  path: LatLng[];
};

/** A stop enriched with the route ids that serve it and its distance from the user. */
export type NearbyStop = Stop & {
  routeIds: string[];
  distanceMeters: number;
};

export type FareQuote = {
  route: ResolvedRoute;
  from: Stop;
  to: Stop;
  hops: number;
  fare: number;
  /** Ordered stops between (and including) from/to. */
  segment: Stop[];
  /** The stop to shout "Alang!" at to signal intent to alight. */
  alightAnnounce: Stop;
};
