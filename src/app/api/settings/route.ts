import { NextRequest, NextResponse } from 'next/server';
import { getTrackingFormat, setTrackingFormat } from '@/lib/trackingNumber';

export async function GET() {
  return NextResponse.json({ tracking_format: getTrackingFormat() });
}

export async function PUT(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const format = json?.tracking_format;
  if (typeof format !== 'string' || format.length < 1 || format.length > 40) {
    return NextResponse.json({ error: 'Invalid format string.' }, { status: 400 });
  }
  setTrackingFormat(format);
  return NextResponse.json({ tracking_format: format });
}
