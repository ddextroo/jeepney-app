/**
 * Sky-blue design tokens — premium iOS / Grab-style.
 * Light UI chrome + dedicated dark tokens for the map / navigation surfaces.
 */

export const palette = {
  // Sky-blue brand scale
  sky100: '#E6F1FF', // primary light
  sky200: '#CFEAFF',
  sky300: '#A8D6FF',
  sky400: '#7CC4FF',
  sky500: '#036FCF', // primary
  sky600: '#0B5FA5',
  sky700: '#084C87', // deep
  sky900: '#06355C',

  // Neutrals / surfaces
  white: '#FFFFFF',
  surface: '#F4F9FF',
  surfaceAlt: '#EDF4FB',
  border: '#E1EBF5',
  ink: '#0E2A3F',
  inkSecondary: '#4A6478',
  inkTertiary: '#6A7682', // secondary gray

  // Semantic
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Map / navigation (dark cartography surfaces)
  mapUserLocation: '#036FCF',
  mapRouteCasing: '#FFFFFF',
  mapHalo: '#0A1626',
  mapInactiveRoute: '#8A94A6',
  navSurface: 'rgba(13, 22, 34, 0.92)', // panel / banner fill on the map
  navSurfaceSolid: '#0D1622',
  navBorder: 'rgba(255,255,255,0.10)',
  navInk: '#FFFFFF',
  navInkMuted: '#B6C2D1',
} as const;

/** Distinct badge colors for jeepney routes (kept in the premium family). */
export const routeColors = [
  '#036FCF', // primary blue
  '#16A34A', // green
  '#7C5CFC', // violet
  '#F59E0B', // amber
  '#00A6A6', // teal
  '#D6336C', // magenta
  '#0B5FA5', // deep blue
  '#EF4444', // coral
] as const;

/** Selected (active) route line color on the dark basemap. */
export const SELECTED_ROUTE_COLOR = '#2F8BFF';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  card: 20,
  lg: 28,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  heading: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  section: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
} as const;

/** Soft, layered shadows for the premium feel. */
export const shadows = {
  card: {
    shadowColor: '#0E2A3F',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  floating: {
    shadowColor: '#0B3B63',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;
