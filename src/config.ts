/**
 * App-level configuration resolved from environment variables.
 * `process.env.MAPBOX_ACCESS_TOKEN` is inlined by babel-preset-expo from `.env`.
 */

export const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ?? '';

/** True when a real token is present — otherwise the app renders the placeholder map. */
export const hasMapboxToken = MAPBOX_ACCESS_TOKEN.length > 0;
