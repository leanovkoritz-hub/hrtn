import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getShipmentById, refreshShipmentStatus } from '@/lib/repository';
import { generateTimeline } from '@/lib/routeGenerator';

// Regenerates the entire tracking_events timeline for a shipment from its
// current origin/destination/date fields. Any manual edits to events are
// discarded and replaced with a fresh auto-generated route.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const shipmentId = parseInt(resolvedParams.id, 10);
  const shipment = getShipmentById(shipmentId);
  if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

  const timeline = generateTimeline({
    originCity: shipment.origin_city,
    originState: shipment.origin_state,
    destCity: shipment.destination_city,
    destState: shipment.destination_state,
    shipDate: shipment.ship_date,
    deliveryDate: shipment.estimated_delivery_date,
  });

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM tracking_events WHERE shipment_id = ?').run(shipmentId);
    const insert = db.prepare(`
      INSERT INTO tracking_events (shipment_id, status, location, city, state, description, event_date, event_time, event_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ev of timeline) {
      insert.run(shipmentId, ev.status, ev.location, ev.city, ev.state, ev.description, ev.event_date, ev.event_time, ev.event_order);
    }
  });
  tx();

  const refreshed = refreshShipmentStatus(shipmentId);
  return NextResponse.json({ shipment: refreshed });
}
