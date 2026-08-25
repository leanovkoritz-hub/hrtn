import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getShipmentById, refreshShipmentStatus } from '@/lib/repository';
import { trackingEventSchema, reorderEventsSchema } from '@/lib/validation';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const shipmentId = parseInt(resolvedParams.id, 10);
  const shipment = getShipmentById(shipmentId);
  if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = trackingEventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const nextOrder = shipment.events.length
    ? Math.max(...shipment.events.map((e) => e.event_order)) + 1
    : 0;

  db.prepare(`
    INSERT INTO tracking_events (shipment_id, status, location, city, state, description, event_date, event_time, event_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(shipmentId, d.status, `${d.city}, ${d.state}`, d.city, d.state, d.description ?? '', d.event_date, d.event_time, nextOrder);

  const refreshed = refreshShipmentStatus(shipmentId);
  return NextResponse.json({ shipment: refreshed }, { status: 201 });
}

// Reorder all events for a shipment: body = { order: [eventId, eventId, ...] } in new order.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const shipmentId = parseInt(resolvedParams.id, 10);
  const shipment = getShipmentById(shipmentId);
  if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = reorderEventsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const validIds = new Set(shipment.events.map((e) => e.id));
  if (parsed.data.order.some((eid) => !validIds.has(eid)) || parsed.data.order.length !== shipment.events.length) {
    return NextResponse.json({ error: 'Order must include every existing event exactly once.' }, { status: 400 });
  }

  const update = db.prepare('UPDATE tracking_events SET event_order = ? WHERE id = ? AND shipment_id = ?');
  const tx = db.transaction((order: number[]) => {
    order.forEach((eventId, index) => update.run(index, eventId, shipmentId));
  });
  tx(parsed.data.order);

  const refreshed = refreshShipmentStatus(shipmentId);
  return NextResponse.json({ shipment: refreshed });
}
