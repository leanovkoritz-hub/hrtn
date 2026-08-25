import { regionOf, hubFor } from './data/regions';

export interface Waypoint {
  status: string;
  city: string;
  state: string;
  description: string;
}

export interface GeneratedEvent extends Waypoint {
  event_date: string;
  event_time: string;
  event_order: number;
  location: string;
}

export interface RouteInput {
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  shipDate: string; // yyyy-mm-dd
  deliveryDate: string; // yyyy-mm-dd
}

/**
 * Builds a logical, geographically-plausible SIMULATED sequence of waypoints
 * between an origin and destination, using a small internal region/hub
 * lookup so intermediate stops make sense (e.g. Dallas -> Atlanta -> Miami)
 * instead of being fully random.
 */
export function buildWaypoints(input: RouteInput): Waypoint[] {
  const { originCity, originState, destCity, destState } = input;
  const originRegion = regionOf(originState);
  const destRegion = regionOf(destState);
  const originHub = hubFor(originState);
  const destHub = hubFor(destState);

  const waypoints: Waypoint[] = [];

  waypoints.push({
    status: 'Order Confirmed',
    city: originCity,
    state: originState,
    description: 'The order has been confirmed and is being prepared for shipment.',
  });
  waypoints.push({
    status: 'Shipment Information Received',
    city: originCity,
    state: originState,
    description: 'Shipping label created; carrier has received electronic shipment information.',
  });
  waypoints.push({
    status: 'Package Picked Up',
    city: originCity,
    state: originState,
    description: 'Package was picked up from the origin facility.',
  });
  waypoints.push({
    status: 'Departed Origin Facility',
    city: originCity,
    state: originState,
    description: `Departed origin facility in ${originCity}, ${originState}.`,
  });

  const sameCityHub = (a: { city: string; state: string }, b: { city: string; state: string }) =>
    a.city.toLowerCase() === b.city.toLowerCase() && a.state === b.state;

  if (originRegion !== destRegion) {
    // Long-haul route: pass through a regional hub near the origin, then one near the destination.
    if (!sameCityHub(originHub, { city: originCity, state: originState })) {
      waypoints.push({
        status: 'Arrived at Regional Facility',
        city: originHub.city,
        state: originHub.state,
        description: `Arrived at regional distribution center in ${originHub.city}, ${originHub.state}.`,
      });
      waypoints.push({
        status: 'Departed Regional Facility',
        city: originHub.city,
        state: originHub.state,
        description: `Departed regional distribution center in ${originHub.city}, ${originHub.state}.`,
      });
    }
    waypoints.push({
      status: 'In Transit',
      city: originHub.city,
      state: originHub.state,
      description: 'Package is in transit to the next facility.',
    });
    if (!sameCityHub(destHub, { city: destCity, state: destState })) {
      waypoints.push({
        status: 'Arrived at Regional Facility',
        city: destHub.city,
        state: destHub.state,
        description: `Arrived at regional distribution center in ${destHub.city}, ${destHub.state}.`,
      });
      waypoints.push({
        status: 'Departed Regional Facility',
        city: destHub.city,
        state: destHub.state,
        description: `Departed regional distribution center in ${destHub.city}, ${destHub.state}.`,
      });
    }
  } else {
    // Shorter, same-region route: a single regional stop if it isn't the same as either endpoint.
    if (
      !sameCityHub(originHub, { city: originCity, state: originState }) &&
      !sameCityHub(originHub, { city: destCity, state: destState })
    ) {
      waypoints.push({
        status: 'In Transit',
        city: originHub.city,
        state: originHub.state,
        description: `Package is in transit through ${originHub.city}, ${originHub.state}.`,
      });
    } else {
      waypoints.push({
        status: 'In Transit',
        city: originCity,
        state: originState,
        description: 'Package is in transit to the destination facility.',
      });
    }
  }

  waypoints.push({
    status: 'Arrived at Destination Facility',
    city: destCity,
    state: destState,
    description: `Arrived at destination facility in ${destCity}, ${destState}.`,
  });
  waypoints.push({
    status: 'Out for Delivery',
    city: destCity,
    state: destState,
    description: 'Package is out for delivery and should arrive today.',
  });
  waypoints.push({
    status: 'Delivered',
    city: destCity,
    state: destState,
    description: `Package was delivered in ${destCity}, ${destState}.`,
  });

  return waypoints;
}

const TIMES = ['08:12', '09:45', '11:20', '13:05', '14:40', '16:15', '17:50', '19:10'];

/**
 * Spreads a list of waypoints across the date range from shipDate to
 * deliveryDate (inclusive), preserving order. The first event lands on
 * shipDate and the last (Delivered) lands on deliveryDate.
 */
export function scheduleEvents(waypoints: Waypoint[], shipDate: string, deliveryDate: string): GeneratedEvent[] {
  const start = new Date(shipDate + 'T00:00:00Z');
  const end = new Date(deliveryDate + 'T00:00:00Z');
  const totalDays = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
  const n = waypoints.length;

  return waypoints.map((wp, i) => {
    const dayOffset = n <= 1 ? 0 : Math.round((i / (n - 1)) * totalDays);
    const date = new Date(start.getTime() + dayOffset * 86400000);
    const iso = date.toISOString().slice(0, 10);
    return {
      ...wp,
      event_date: iso,
      event_time: TIMES[i % TIMES.length],
      event_order: i,
      location: `${wp.city}, ${wp.state}`,
    };
  });
}

export function generateTimeline(input: RouteInput): GeneratedEvent[] {
  const waypoints = buildWaypoints(input);
  return scheduleEvents(waypoints, input.shipDate, input.deliveryDate);
}
