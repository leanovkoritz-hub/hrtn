import { db } from './db';
import { Shipment, TrackingEvent, ShipmentWithEvents } from './types';
import { computeCurrentState } from './statusEngine';

export function getEventsForShipment(shipmentId: number): TrackingEvent[] {
  return db
    .prepare('SELECT * FROM tracking_events WHERE shipment_id = ? ORDER BY event_order ASC')
    .all(shipmentId) as TrackingEvent[];
}

export function getShipmentByTrackingNumber(trackingNumber: string): ShipmentWithEvents | null {
  const shipment = db
    .prepare('SELECT * FROM shipments WHERE tracking_number = ?')
    .get(trackingNumber.trim()) as Shipment | undefined;
  if (!shipment) return null;
  return { ...shipment, events: getEventsForShipment(shipment.id) };
}

export function getShipmentById(id: number): ShipmentWithEvents | null {
  const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(id) as Shipment | undefined;
  if (!shipment) return null;
  return { ...shipment, events: getEventsForShipment(shipment.id) };
}

export function listShipments(filter?: { status?: string; search?: string }): ShipmentWithEvents[] {
  let query = 'SELECT * FROM shipments';
  const clauses: string[] = [];
  const params: string[] = [];

  if (filter?.status && filter.status !== 'ALL') {
    clauses.push('current_status = ?');
    params.push(filter.status);
  }
  if (filter?.search) {
    clauses.push('(tracking_number LIKE ? OR order_id LIKE ? OR product_name LIKE ?)');
    const like = `%${filter.search}%`;
    params.push(like, like, like);
  }
  if (clauses.length) query += ' WHERE ' + clauses.join(' AND ');
  query += ' ORDER BY created_at DESC';

  const shipments = db.prepare(query).all(...params) as Shipment[];
  return shipments.map((s) => ({ ...s, events: getEventsForShipment(s.id) }));
}

/**
 * Recomputes and persists the current_status/current_location fields for a
 * shipment based on today's date, when auto_progression is enabled. This is
 * what makes the tracking status update automatically over time without any
 * manual daily edits.
 */
export function refreshShipmentStatus(shipmentId: number): ShipmentWithEvents | null {
  const shipment = getShipmentById(shipmentId);
  if (!shipment) return null;
  if (!shipment.auto_progression) return shipment;

  const { status, location } = computeCurrentState(shipment.events);
  db.prepare(
    'UPDATE shipments SET current_status = ?, current_location = ?, updated_at = datetime(\'now\') WHERE id = ?'
  ).run(status, location, shipmentId);

  return getShipmentById(shipmentId);
}

export interface DashboardCounts {
  total: number;
  PROCESSING: number;
  IN_TRANSIT: number;
  OUT_FOR_DELIVERY: number;
  DELIVERED: number;
  EXCEPTION: number;
}

export function dashboardCounts(): DashboardCounts {
  const rows = db.prepare('SELECT current_status, COUNT(*) as c FROM shipments GROUP BY current_status').all() as {
    current_status: string;
    c: number;
  }[];
  const counts: Omit<DashboardCounts, 'total'> = {
    PROCESSING: 0,
    IN_TRANSIT: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
    EXCEPTION: 0,
  };
  for (const r of rows) {
    if (r.current_status in counts) {
      (counts as Record<string, number>)[r.current_status] = r.c;
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { total, ...counts };
}
