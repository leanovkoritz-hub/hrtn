import { TrackingEvent, ShipmentStatus } from './types';

const STATUS_MAP: Record<string, ShipmentStatus> = {
  'Order Confirmed': 'PROCESSING',
  'Shipment Information Received': 'PROCESSING',
  'Package Picked Up': 'PROCESSING',
  'Departed Origin Facility': 'IN_TRANSIT',
  'In Transit': 'IN_TRANSIT',
  'Arrived at Regional Facility': 'IN_TRANSIT',
  'Departed Regional Facility': 'IN_TRANSIT',
  'Arrived at Destination Facility': 'IN_TRANSIT',
  'Out for Delivery': 'OUT_FOR_DELIVERY',
  'Delivered': 'DELIVERED',
};

export function statusForEventLabel(label: string): ShipmentStatus {
  return STATUS_MAP[label] ?? 'IN_TRANSIT';
}

/**
 * Given a shipment's chronological events and today's date, determines which
 * event is the "current" one (the most recent event whose date has passed)
 * and derives the resulting status + location. This is what lets the public
 * tracking page and dashboard counts update automatically without any
 * manual daily intervention.
 */
export function computeCurrentState(
  events: TrackingEvent[],
  today: Date = new Date()
): { status: ShipmentStatus; location: string; latestEvent: TrackingEvent | null; progress: number } {
  if (events.length === 0) {
    return { status: 'PROCESSING', location: '', latestEvent: null, progress: 0 };
  }

  const sorted = [...events].sort((a, b) => a.event_order - b.event_order);
  const todayStr = today.toISOString().slice(0, 10);

  let latest = sorted[0];
  for (const ev of sorted) {
    if (ev.event_date <= todayStr) {
      latest = ev;
    } else {
      break;
    }
  }

  const status = statusForEventLabel(latest.status);
  const progress = Math.round(((sorted.indexOf(latest) + 1) / sorted.length) * 100);

  return {
    status,
    location: latest.location,
    latestEvent: latest,
    progress,
  };
}
