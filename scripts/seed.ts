import 'dotenv/config';
import { db } from '../src/lib/db';
import { generateTrackingNumber } from '../src/lib/trackingNumber';
import { generateTimeline } from '../src/lib/routeGenerator';
import { statusForEventLabel } from '../src/lib/statusEngine';

function seed() {
  const existing = db.prepare('SELECT COUNT(*) as c FROM shipments').get() as { c: number };
  if (existing.c > 0) {
    console.log(`Database already has ${existing.c} shipment(s) - skipping seed.`);
    return;
  }

  const shipDate = '2026-08-24';
  const deliveryDate = '2026-08-30';

  const timeline = generateTimeline({
    originCity: 'Dallas',
    originState: 'TX',
    destCity: 'Miami',
    destState: 'FL',
    shipDate,
    deliveryDate,
  });

  const trackingNumber = generateTrackingNumber('FEDEX');
  const firstEvent = timeline[0];

  const result = db
    .prepare(`
      INSERT INTO shipments (
        tracking_number, order_id, product_name, customer_name, carrier,
        origin_city, origin_state, destination_city, destination_state,
        ship_date, estimated_delivery_date, current_status, current_location,
        auto_progression, update_interval_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      trackingNumber,
      'ORD-10024',
      'Zero Turn Mower',
      'Jamie Rivera',
      'FEDEX',
      'Dallas',
      'TX',
      'Miami',
      'FL',
      shipDate,
      deliveryDate,
      statusForEventLabel(firstEvent.status),
      firstEvent.location,
      1,
      1
    );

  const shipmentId = result.lastInsertRowid as number;

  const insertEvent = db.prepare(`
    INSERT INTO tracking_events (shipment_id, status, location, city, state, description, event_date, event_time, event_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const ev of timeline) {
    insertEvent.run(shipmentId, ev.status, ev.location, ev.city, ev.state, ev.description, ev.event_date, ev.event_time, ev.event_order);
  }

  console.log('Seeded demo shipment:');
  console.log(`  Tracking number: ${trackingNumber}`);
  console.log(`  Public URL: /track/${trackingNumber}`);
}

seed();
