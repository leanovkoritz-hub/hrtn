// A small internal reference dataset used only to make simulated routes look
// geographically plausible. This is NOT connected to any real carrier system.

export interface HubCity {
  city: string;
  state: string;
}

// Group US states into logical regions, each with a "regional distribution
// center" hub city. This lets the route generator pick sensible intermediate
// stops between an origin state and a destination state.
export const STATE_REGION: Record<string, string> = {
  ME: 'Northeast', NH: 'Northeast', VT: 'Northeast', MA: 'Northeast', RI: 'Northeast',
  CT: 'Northeast', NY: 'Northeast', NJ: 'Northeast', PA: 'Northeast',

  OH: 'Midwest', MI: 'Midwest', IN: 'Midwest', IL: 'Midwest', WI: 'Midwest',
  MN: 'Midwest', IA: 'Midwest', MO: 'Midwest', ND: 'Midwest', SD: 'Midwest', NE: 'Midwest', KS: 'Midwest',

  DE: 'Southeast', MD: 'Southeast', VA: 'Southeast', WV: 'Southeast', NC: 'Southeast',
  SC: 'Southeast', GA: 'Southeast', FL: 'Southeast', KY: 'Southeast', TN: 'Southeast',
  AL: 'Southeast', MS: 'Southeast', DC: 'Southeast',

  AR: 'South Central', LA: 'South Central', OK: 'South Central', TX: 'South Central',

  MT: 'Mountain West', ID: 'Mountain West', WY: 'Mountain West', CO: 'Mountain West',
  NM: 'Mountain West', AZ: 'Mountain West', UT: 'Mountain West', NV: 'Mountain West',

  WA: 'Pacific', OR: 'Pacific', CA: 'Pacific', AK: 'Pacific', HI: 'Pacific',
};

export const REGION_HUB: Record<string, HubCity> = {
  'Northeast': { city: 'Harrisburg', state: 'PA' },
  'Midwest': { city: 'Chicago', state: 'IL' },
  'Southeast': { city: 'Atlanta', state: 'GA' },
  'South Central': { city: 'Dallas', state: 'TX' },
  'Mountain West': { city: 'Denver', state: 'CO' },
  'Pacific': { city: 'Ontario', state: 'CA' },
};

export function regionOf(state: string): string {
  return STATE_REGION[state.toUpperCase()] ?? 'National';
}

export function hubFor(state: string): HubCity {
  const region = regionOf(state);
  return REGION_HUB[region] ?? { city: 'Louisville', state: 'KY' };
}
