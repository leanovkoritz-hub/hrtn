import { NextRequest, NextResponse } from 'next/server';
import { getShipmentByTrackingNumber, refreshShipmentStatus } from '@/lib/repository';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  const resolvedParams = await params;
  const raw = resolvedParams.trackingNumber;
  if (!raw || typeof raw !== 'string' || raw.length > 40) {
    return NextResponse.json({ error: 'Invalid tracking number.' }, { status: 400 });
  }
  // Server-side validation: only allow the characters a real tracking number could contain.
  const clean = raw.trim().toUpperCase();
  if (!/^[A-Z0-9]{5,40}$/.test(clean)) {
    return NextResponse.json({ error: 'Invalid tracking number format.' }, { status: 400 });
  }

  const existing = getShipmentByTrackingNumber(clean);
  if (!existing) {
    return NextResponse.json({ error: 'No shipment found for that tracking number.' }, { status: 404 });
  }

  const refreshed = refreshShipmentStatus(existing.id) ?? existing;
  return NextResponse.json({ shipment: refreshed });
}
