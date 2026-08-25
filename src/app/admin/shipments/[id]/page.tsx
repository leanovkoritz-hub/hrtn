'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import StatusBadge from '@/components/StatusBadge';
import type { ShipmentWithEvents, TrackingEvent } from '@/lib/types';

const CARRIERS = ['UPS', 'FEDEX', 'USPS', 'DHL', 'CUSTOM'];
const STATUSES = ['PROCESSING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'];

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600';
const labelCls = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide';

export default function EditShipmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<ShipmentWithEvents | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ status: '', city: '', state: '', description: '', event_date: '', event_time: '09:00' });

  const load = useCallback(async () => {
    const res = await fetch(`/api/shipments/${id}`);
    if (res.ok) {
      const data = await res.json();
      setShipment(data.shipment);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  }

  async function saveFields(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (res.ok) {
        setShipment(data.shipment);
        flash('Saved');
      }
    } finally {
      setSaving(false);
    }
  }

  async function regenerateRoute() {
    if (!confirm('This replaces all current tracking events with a freshly generated route. Continue?')) return;
    setSaving(true);
    const res = await fetch(`/api/shipments/${id}/generate-route`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setShipment(data.shipment);
      flash('Route regenerated');
    }
    setSaving(false);
  }

  async function regenerateTracking() {
    setSaving(true);
    const res = await fetch(`/api/shipments/${id}/regenerate-tracking`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setShipment(data.shipment);
      flash('Tracking number regenerated');
    }
    setSaving(false);
  }

  async function deleteShipment() {
    if (!confirm('Delete this shipment permanently?')) return;
    await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
    router.push('/admin/shipments');
  }

  async function addEvent() {
    if (!newEvent.status || !newEvent.city || !newEvent.state || !newEvent.event_date) return;
    const res = await fetch(`/api/shipments/${id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
    const data = await res.json();
    if (res.ok) {
      setShipment(data.shipment);
      setNewEvent({ status: '', city: '', state: '', description: '', event_date: '', event_time: '09:00' });
      flash('Event added');
    }
  }

  async function updateEvent(ev: TrackingEvent, patch: Partial<TrackingEvent>) {
    const res = await fetch(`/api/shipments/${id}/events/${ev.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) setShipment(data.shipment);
  }

  async function deleteEvent(eventId: number) {
    const res = await fetch(`/api/shipments/${id}/events/${eventId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) setShipment(data.shipment);
  }

  async function moveEvent(index: number, direction: -1 | 1) {
    if (!shipment) return;
    const events = [...shipment.events];
    const target = index + direction;
    if (target < 0 || target >= events.length) return;
    [events[index], events[target]] = [events[target], events[index]];
    const order = events.map((e) => e.id);
    const res = await fetch(`/api/shipments/${id}/events`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
    const data = await res.json();
    if (res.ok) setShipment(data.shipment);
  }

  function copyUrl() {
    if (!shipment) return;
    navigator.clipboard.writeText(`${window.location.origin}/track/${shipment.tracking_number}`);
    flash('Public URL copied');
  }

  if (loading) {
    return (
      <AdminShell>
        <p className="text-slate-500 text-sm">Loading...</p>
      </AdminShell>
    );
  }

  if (!shipment) {
    return (
      <AdminShell>
        <p className="text-slate-500 text-sm">Shipment not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{shipment.product_name}</h1>
          <p className="text-sm text-slate-500 font-mono mt-1">{shipment.tracking_number}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={shipment.current_status} />
          {message && <span className="text-xs text-emerald-600 font-medium">{message}</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 my-5">
        <button onClick={copyUrl} className="btn-secondary">Copy Public URL</button>
        <Link href={`/track/${shipment.tracking_number}`} target="_blank" className="btn-secondary">Preview Tracking Page</Link>
        <button onClick={regenerateTracking} disabled={saving} className="btn-secondary">Regenerate Tracking #</button>
        <button onClick={regenerateRoute} disabled={saving} className="btn-secondary">Regenerate Route</button>
        <button onClick={deleteShipment} className="btn-danger">Delete Shipment</button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Shipment details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 h-fit">
          <h2 className="font-semibold text-slate-900">Shipment Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Order ID" value={shipment.order_id} onBlurSave={(v) => saveFields({ order_id: v })} />
            <Field label="Product Name" value={shipment.product_name} onBlurSave={(v) => saveFields({ product_name: v })} />
            <Field
              label="Customer Name"
              value={shipment.customer_name ?? ''}
              onBlurSave={(v) => saveFields({ customer_name: v })}
            />
            <div>
              <label className={labelCls}>Carrier Style</label>
              <select
                className={inputCls}
                value={shipment.carrier}
                onChange={(e) => saveFields({ carrier: e.target.value })}
              >
                {CARRIERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Field label="Origin City" value={shipment.origin_city} onBlurSave={(v) => saveFields({ origin_city: v })} />
            <Field label="Origin State" value={shipment.origin_state} onBlurSave={(v) => saveFields({ origin_state: v })} />
            <Field label="Destination City" value={shipment.destination_city} onBlurSave={(v) => saveFields({ destination_city: v })} />
            <Field label="Destination State" value={shipment.destination_state} onBlurSave={(v) => saveFields({ destination_state: v })} />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className={labelCls}>Ship Date</label>
              <input
                type="date"
                className={inputCls}
                defaultValue={shipment.ship_date}
                onBlur={(e) => saveFields({ ship_date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Estimated Delivery</label>
              <input
                type="date"
                className={inputCls}
                defaultValue={shipment.estimated_delivery_date}
                onBlur={(e) => saveFields({ estimated_delivery_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className={labelCls}>Progression Mode</label>
              <select
                className={inputCls}
                value={shipment.auto_progression ? 'auto' : 'manual'}
                onChange={(e) => saveFields({ auto_progression: e.target.value === 'auto' })}
              >
                <option value="auto">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Current Status {shipment.auto_progression ? '(auto)' : ''}</label>
              <select
                className={inputCls}
                value={shipment.current_status}
                disabled={!!shipment.auto_progression}
                onChange={(e) => saveFields({ current_status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            In automatic mode, status and current location are recalculated from today&apos;s date every time the
            tracking page or dashboard loads &mdash; no manual daily updates needed.
          </p>
        </div>

        {/* Tracking events */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Tracking Timeline</h2>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {shipment.events.map((ev, i) => (
              <div key={ev.id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1.5">
                    <input
                      className="w-full text-sm font-semibold border-b border-transparent hover:border-slate-200 focus:border-brand-600 focus:outline-none"
                      defaultValue={ev.status}
                      onBlur={(e) => updateEvent(ev, { status: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <input
                        className="w-1/2 text-xs text-slate-600 border-b border-transparent hover:border-slate-200 focus:border-brand-600 focus:outline-none"
                        defaultValue={ev.city}
                        onBlur={(e) => updateEvent(ev, { city: e.target.value })}
                      />
                      <input
                        className="w-1/2 text-xs text-slate-600 border-b border-transparent hover:border-slate-200 focus:border-brand-600 focus:outline-none"
                        defaultValue={ev.state}
                        onBlur={(e) => updateEvent(ev, { state: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="text-xs text-slate-500 border-b border-transparent hover:border-slate-200 focus:border-brand-600 focus:outline-none"
                        defaultValue={ev.event_date}
                        onBlur={(e) => updateEvent(ev, { event_date: e.target.value })}
                      />
                      <input
                        type="time"
                        className="text-xs text-slate-500 border-b border-transparent hover:border-slate-200 focus:border-brand-600 focus:outline-none"
                        defaultValue={ev.event_time}
                        onBlur={(e) => updateEvent(ev, { event_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => moveEvent(i, -1)} className="text-slate-400 hover:text-slate-700 text-xs">&uarr;</button>
                    <button onClick={() => moveEvent(i, 1)} className="text-slate-400 hover:text-slate-700 text-xs">&darr;</button>
                    <button onClick={() => deleteEvent(ev.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <p className={labelCls}>Add Event</p>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Status" className={inputCls} value={newEvent.status} onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })} />
              <input placeholder="City" className={inputCls} value={newEvent.city} onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })} />
              <input placeholder="State" className={inputCls} value={newEvent.state} onChange={(e) => setNewEvent({ ...newEvent, state: e.target.value })} />
              <input type="date" className={inputCls} value={newEvent.event_date} onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })} />
            </div>
            <input
              placeholder="Description (optional)"
              className={inputCls}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
            <button onClick={addEvent} className="btn-secondary w-full">+ Add Tracking Event</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Field({ label, value, onBlurSave }: { label: string; value: string; onBlurSave: (v: string) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={inputCls} defaultValue={value} onBlur={(e) => onBlurSave(e.target.value)} />
    </div>
  );
}
