import type { Stop } from './types';

/**
 * Curated Metro Cebu stops (Cebu City, Mandaue, Lapu-Lapu, Talisay, Consolacion).
 * Coordinates are approximate landmarks, chosen to form coherent corridors for the demo map.
 */
export const STOPS: Record<string, Stop> = {
  // Downtown Cebu (west-central)
  carbon: { id: 'carbon', name: 'Carbon Market', shortName: 'Carbon', lat: 10.3065, lng: 123.8915 },
  colon: { id: 'colon', name: 'Colon Street', shortName: 'Colon', lat: 10.3078, lng: 123.8888 },
  capitol: { id: 'capitol', name: 'Provincial Capitol', shortName: 'Capitol', lat: 10.3055, lng: 123.8858 },
  usc: { id: 'usc', name: 'USC Main', shortName: 'USC', lat: 10.2965, lng: 123.8995 },
  usjr: { id: 'usjr', name: 'USJ-R College of Arts & Sciences', shortName: 'USJ-R', lat: 10.2988, lng: 123.8935 },
  uv: { id: 'uv', name: 'University of the Visayas', shortName: 'UV', lat: 10.301, lng: 123.8898 },

  // Central business / Osmeña corridor
  fuente: { id: 'fuente', name: 'Fuente Osmeña', shortName: 'Fuente', lat: 10.3155, lng: 123.893 },
  mabolo: { id: 'mabolo', name: 'Mabolo', shortName: 'Mabolo', lat: 10.319, lng: 123.8985 },
  smcebu: { id: 'smcebu', name: 'SM City Cebu', shortName: 'SM Cebu', lat: 10.3205, lng: 123.905 },
  itpark: { id: 'itpark', name: 'IT Park', shortName: 'IT Park', lat: 10.3215, lng: 123.9018 },
  c3: { id: 'c3', name: 'C3 Market & University', shortName: 'C3', lat: 10.3195, lng: 123.9 },
  ayala: { id: 'ayala', name: 'Ayala Center Cebu', shortName: 'Ayala', lat: 10.325, lng: 123.9038 },
  lahug: { id: 'lahug', name: 'Lahug', shortName: 'Lahug', lat: 10.3285, lng: 123.8995 },
  lasalle: { id: 'lasalle', name: 'La Salle (DLSU-CSJ)', shortName: 'La Salle', lat: 10.3232, lng: 123.9068 },

  // North / Gov. Cuenco & Banilad
  gov_cuenco: { id: 'gov_cuenco', name: 'Gov. M. Cuenco Ave.', shortName: 'Cuenco', lat: 10.34, lng: 123.898 },
  banilad: { id: 'banilad', name: 'Banilad', shortName: 'Banilad', lat: 10.352, lng: 123.908 },
  uptown: { id: 'uptown', name: 'Uptown (A.S. Fortuna)', shortName: 'Uptown', lat: 10.348, lng: 123.912 },
  upcebu: { id: 'upcebu', name: 'UP Cebu', shortName: 'UP Cebu', lat: 10.362, lng: 123.912 },
  butuan: { id: 'butuan', name: 'Butuan Road', shortName: 'Butuan', lat: 10.356, lng: 123.905 },
  guadalupe: { id: 'guadalupe', name: 'Guadalupe', shortName: 'Guadalupe', lat: 10.305, lng: 123.925 },
  mansilay: { id: 'mansilay', name: 'Mansilay', shortName: 'Mansilay', lat: 10.385, lng: 123.918 },
  consolacion: { id: 'consolacion', name: 'Consolacion (SM)', shortName: 'Consolacion', lat: 10.408, lng: 123.945 },

  // Mandaue
  ateneo: { id: 'ateneo', name: 'Ateneo de Cebu', shortName: 'Ateneo', lat: 10.338, lng: 123.94 },
  mandaue_pob: { id: 'mandaue_pob', name: 'Mandaue Poblacion', shortName: 'Mandaue', lat: 10.33, lng: 123.943 },
  jcentre: { id: 'jcentre', name: 'J Centre / Mandaue Town', shortName: 'J Centre', lat: 10.327, lng: 123.9465 },
  gaisano_north: { id: 'gaisano_north', name: 'Gaisano Northern Cebu', shortName: 'Gaisano N.', lat: 10.335, lng: 123.952 },

  // Lapu-Lapu / Mactan
  lapulapu_flag: { id: 'lapulapu_flag', name: 'Lapu-Lapu Statue (Maribago Rd)', shortName: 'LL Statue', lat: 10.318, lng: 123.99 },
  maribago: { id: 'maribago', name: 'Maribago', shortName: 'Maribago', lat: 10.285, lng: 124.003 },

  // South Road / Talisay
  talisay: { id: 'talisay', name: 'Talisay Poblacion', shortName: 'Talisay', lat: 10.265, lng: 123.836 },
};

export const ALL_STOPS: Stop[] = Object.values(STOPS);

export function getStop(id: string): Stop {
  const stop = STOPS[id];
  if (!stop) throw new Error(`Unknown stop id: ${id}`);
  return stop;
}
