import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { refreshShipmentStatus, getShipmentById } from '@/lib/repository';
import { trackingEventSchema } from '@/lib/validation';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  const shipmentId = parseInt(params.id, 10);
  const eventId = parseInt(params.eventId, 10);
  const shipment = getShipmentById(shipmentId);
  if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

  const event = shipment.events.find((e) => e.id === eventId);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = trackingEventSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const city = d.city ?? event.city;
  const state = d.state ?? event.state;

  db.prepare(`
    UPDATE tracking_events
    SET status = ?, city = ?, state = ?, location = ?, description = ?, event_date = ?, event_time = ?
    WHERE id = ? AND shipment_id = ?
  `).run(
    d.status ?? event.status,
    city,
    state,
    `${city}, ${state}`,
    d.description ?? event.description,
    d.event_date ?? event.event_date,
    d.event_time ?? event.event_time,
    eventId,
    shipmentId
  );

  const refreshed = refreshShipmentStatus(shipmentId);
  return NextResponse.json({ shipment: refreshed });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  const shipmentId = parseInt(params.id, 10);
  const eventId = parseInt(params.eventId, 10);
  const shipment = getShipmentById(shipmentId);
  if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

  db.prepare('DELETE FROM tracking_events WHERE id = ? AND shipment_id = ?').run(eventId, shipmentId);

  const refreshed = refreshShipmentStatus(shipmentId);
  return NextResponse.json({ shipment: refreshed });
}
