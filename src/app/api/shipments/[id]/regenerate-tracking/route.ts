import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getShipmentById } from '@/lib/repository';
import { generateTrackingNumber } from '@/lib/trackingNumber';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const shipmentId = parseInt(params.id, 10);
  const shipment = getShipmentById(shipmentId);
  if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });

  const trackingNumber = generateTrackingNumber(shipment.carrier);
  db.prepare("UPDATE shipments SET tracking_number = ?, updated_at = datetime('now') WHERE id = ?").run(
    trackingNumber,
    shipmentId
  );

  return NextResponse.json({ shipment: getShipmentById(shipmentId) });
}
