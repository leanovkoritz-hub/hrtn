import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getShipmentById, refreshShipmentStatus } from '@/lib/repository';
import { updateShipmentSchema } from '@/lib/validation';

function parseId(idParam: string) {
  const id = parseInt(idParam, 10);
  return Number.isFinite(id) ? id : null;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const shipment = refreshShipmentStatus(id) ?? getShipmentById(id);

  if (!shipment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ shipment });
}

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const existing = getShipmentById(id);

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = updateShipmentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid input',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const d = parsed.data;

  const fields: string[] = [];
  const values: Record<string, unknown> = { id };

  const maybeSet = (col: string, val: unknown) => {
    if (val !== undefined) {
      fields.push(`${col} = @${col}`);
      values[col] = val;
    }
  };

  maybeSet('order_id', d.order_id);
  maybeSet('product_name', d.product_name);
  maybeSet('customer_name', d.customer_name ?? null);
  maybeSet('carrier', d.carrier);
  maybeSet('origin_city', d.origin_city);
  maybeSet('origin_state', d.origin_state?.toUpperCase());
  maybeSet('destination_city', d.destination_city);
  maybeSet('destination_state', d.destination_state?.toUpperCase());
  maybeSet('ship_date', d.ship_date);
  maybeSet('estimated_delivery_date', d.estimated_delivery_date);
  maybeSet('current_status', d.current_status);
  maybeSet('current_location', d.current_location);

  if (d.auto_progression !== undefined) {
    maybeSet('auto_progression', d.auto_progression ? 1 : 0);
  }

  maybeSet('update_interval_days', d.update_interval_days);

  if (fields.length) {
    fields.push("updated_at = datetime('now')");

    db.prepare(
      `UPDATE shipments SET ${fields.join(', ')} WHERE id = @id`
    ).run(values);
  }

  const refreshed = refreshShipmentStatus(id) ?? getShipmentById(id);

  return NextResponse.json({ shipment: refreshed });
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const existing = getShipmentById(id);

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  db.prepare('DELETE FROM shipments WHERE id = ?').run(id);

  return NextResponse.json({ ok: true });
}