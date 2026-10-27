import { routeColors } from '@/theme';

import type { RouteDefinition } from './types';

/**
 * Curated Metro Cebu jeepney routes using the local route-number + destination convention.
 * Fares reflect the modernized jeepney PTJ fare matrix in Cebu (₱13 minimum).
 */
export const ROUTES: RouteDefinition[] = [
  {
    id: 'r-18',
    code: '18',
    name: 'OSMEÑA',
    description: 'Carbon -> Butuan Rd via Osmeña Blvd / Gov. Cuenco',
    color: routeColors[0],
    fare: { min: 13, max: 17 },
    stopIds: ['carbon', 'fuente', 'mabolo', 'lahug', 'gov_cuenco', 'banilad', 'butuan'],
  },
  {
    id: 'r-182',
    code: '182',
    name: 'GUADALUPE',
    description: 'Carbon -> Guadalupe via Uptown',
    color: routeColors[2],
    fare: { min: 13, max: 16 },
    stopIds: ['carbon', 'fuente', 'uptown', 'guadalupe'],
  },
  {
    id: 'r-143',
    code: '143',
    name: 'MANSILAY',
    description: 'Ayala Center -> Mansilay via Gov. Cuenco / North Road',
    color: routeColors[1],
    fare: { min: 13, max: 18 },
    stopIds: ['ayala', 'itpark', 'fuente', 'gov_cuenco', 'banilad', 'upcebu', 'mansilay'],
  },
  {
    id: 'r-14n',
    code: '14N',
    name: 'MANSILAY',
    description: 'Carbon -> Mansilay via Banilad / UP Cebu',
    color: routeColors[3],
    fare: { min: 13, max: 18 },
    stopIds: ['carbon', 'fuente', 'mabolo', 'banilad', 'upcebu', 'mansilay'],
  },
  {
    id: 'r-167',
    code: '167',
    name: 'LAHUG / USC',
    description: 'Colon -> USC -> Lahug',
    color: routeColors[4],
    fare: { min: 13, max: 15 },
    stopIds: ['colon', 'usc', 'fuente', 'itpark', 'lahug'],
  },
  {
    id: 'r-24c',
    code: '24-C',
    name: 'MANDAUE',
    description: 'Colon -> C. Odiazabal -> A. Del Norte -> Mandaue',
    color: routeColors[5],
    fare: { min: 13, max: 18 },
    stopIds: ['colon', 'fuente', 'mabolo', 'ateneo', 'mandaue_pob', 'jcentre'],
  },
  {
    id: 'r-7',
    code: '7',
    name: 'MANDAUE POBLACION',
    description: 'Carbon -> Mandaue Poblacion via C. Odiazabal',
    color: routeColors[6],
    fare: { min: 13, max: 17 },
    stopIds: ['carbon', 'fuente', 'ateneo', 'mandaue_pob'],
  },
  {
    id: 'r-10a',
    code: '10-A',
    name: 'LAPU-LAPU',
    description: 'USC -> Mandaue -> Lapu-Lapu (via Consolacion Rd)',
    color: routeColors[7],
    fare: { min: 15, max: 20 },
    stopIds: ['usc', 'fuente', 'mabolo', 'ateneo', 'gaisano_north', 'lapulapu_flag', 'maribago'],
  },
  {
    id: 'r-123',
    code: '123',
    name: 'TALISAY',
    description: 'Carbon -> Talisay via Cebu South Road',
    color: routeColors[2],
    fare: { min: 13, max: 19 },
    stopIds: ['carbon', 'colon', 'usc', 'talisay'],
  },
  {
    id: 'r-univ',
    code: 'UNIV',
    name: 'UNIVERSITY',
    description: 'USC -> USJ-R -> UV -> La Salle -> SM Cebu',
    color: routeColors[0],
    fare: { min: 13, max: 15 },
    stopIds: ['usc', 'usjr', 'uv', 'fuente', 'lasalle', 'smcebu'],
  },
];
