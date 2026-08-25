import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listShipments, getShipmentById, refreshShipmentStatus } from '@/lib/repository';
import { generateTrackingNumber } from '@/lib/trackingNumber';
import { generateTimeline } from '@/lib/routeGenerator';
import { statusForEventLabel } from '@/lib/statusEngine';
import { createShipmentSchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const shipments = listShipments({ status, search });
  // Keep displayed status fresh for every shipment with auto progression on.
  const refreshed = shipments.map((s) => refreshShipmentStatus(s.id) ?? s);
  return NextResponse.json({ shipments: refreshed });
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = createShipmentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (new Date(data.estimated_delivery_date) < new Date(data.ship_date)) {
    return NextResponse.json({ error: 'Estimated delivery date must be on or after the ship date.' }, { status: 400 });
  }

  let trackingNumber = data.custom_tracking_number?.trim().toUpperCase();
  if (trackingNumber) {
    const clash = db.prepare('SELECT 1 FROM shipments WHERE tracking_number = ?').get(trackingNumber);
    if (clash) {
      return NextResponse.json({ error: 'That tracking number is already in use.' }, { status: 409 });
    }
  } else {
    trackingNumber = generateTrackingNumber(data.carrier);
  }

  const timeline = generateTimeline({
    originCity: data.origin_city,
    originState: data.origin_state,
    destCity: data.destination_city,
    destState: data.destination_state,
    shipDate: data.ship_date,
    deliveryDate: data.estimated_delivery_date,
  });

  const insertShipment = db.prepare(`
    INSERT INTO shipments (
      tracking_number, order_id, product_name, customer_name, carrier,
      origin_city, origin_state, destination_city, destination_state,
      ship_date, estimated_delivery_date, current_status, current_location,
      auto_progression, update_interval_days
    ) VALUES (@tracking_number, @order_id, @product_name, @customer_name, @carrier,
      @origin_city, @origin_state, @destination_city, @destination_state,
      @ship_date, @estimated_delivery_date, @current_status, @current_location,
      @auto_progression, @update_interval_days)
  `);

  const firstEvent = timeline[0];
  const result = insertShipment.run({
    tracking_number: trackingNumber,
    order_id: data.order_id,
    product_name: data.product_name,
    customer_name: data.customer_name ?? null,
    carrier: data.carrier,
    origin_city: data.origin_city,
    origin_state: data.origin_state.toUpperCase(),
    destination_city: data.destination_city,
    destination_state: data.destination_state.toUpperCase(),
    ship_date: data.ship_date,
    estimated_delivery_date: data.estimated_delivery_date,
    current_status: statusForEventLabel(firstEvent.status),
    current_location: firstEvent.location,
    auto_progression: data.auto_progression ? 1 : 0,
    update_interval_days: data.update_interval_days,
  });

  const shipmentId = result.lastInsertRowid as number;

  const insertEvent = db.prepare(`
    INSERT INTO tracking_events (shipment_id, status, location, city, state, description, event_date, event_time, event_order)
    VALUES (@shipment_id, @status, @location, @city, @state, @description, @event_date, @event_time, @event_order)
  `);
  for (const ev of timeline) {
    insertEvent.run({ shipment_id: shipmentId, ...ev });
  }

  const refreshed = refreshShipmentStatus(shipmentId) ?? getShipmentById(shipmentId);
  return NextResponse.json({ shipment: refreshed }, { status: 201 });
}
