'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';

const CARRIERS = ['UPS', 'FEDEX', 'USPS', 'DHL', 'CUSTOM'];

const todayIso = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export default function NewShipmentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    order_id: '',
    product_name: '',
    customer_name: '',
    carrier: 'CUSTOM',
    origin_city: '',
    origin_state: '',
    destination_city: '',
    destination_state: '',
    ship_date: todayIso(),
    estimated_delivery_date: plusDays(5),
    auto_progression: true,
    update_interval_days: 1,
    custom_tracking_number: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          customer_name: form.customer_name || null,
          custom_tracking_number: form.custom_tracking_number || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create shipment.');
        return;
      }
      router.push(`/admin/shipments/${data.shipment.id}`);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600';
  const labelCls = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide';

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Shipment</h1>
      <p className="text-sm text-slate-500 mb-6">
        Enter the basics and SimTrack will automatically generate a tracking number, a logical
        simulated route, and a full tracking timeline when you save.
      </p>

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Order ID *</label>
            <input className={inputCls} value={form.order_id} onChange={(e) => set('order_id', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Product Name *</label>
            <input className={inputCls} value={form.product_name} onChange={(e) => set('product_name', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Customer Name (optional)</label>
            <input className={inputCls} value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Carrier Style</label>
            <select className={inputCls} value={form.carrier} onChange={(e) => set('carrier', e.target.value)}>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Route</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Ship From City *</label>
              <input className={inputCls} value={form.origin_city} onChange={(e) => set('origin_city', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Ship From State *</label>
              <input
                className={inputCls}
                value={form.origin_state}
                maxLength={2}
                placeholder="TX"
                onChange={(e) => set('origin_state', e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className={labelCls}>Ship To City *</label>
              <input className={inputCls} value={form.destination_city} onChange={(e) => set('destination_city', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Ship To State *</label>
              <input
                className={inputCls}
                value={form.destination_state}
                maxLength={2}
                placeholder="FL"
                onChange={(e) => set('destination_state', e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Dates &amp; Progression</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Ship Date *</label>
              <input type="date" className={inputCls} value={form.ship_date} onChange={(e) => set('ship_date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Estimated Delivery Date *</label>
              <input
                type="date"
                className={inputCls}
                value={form.estimated_delivery_date}
                onChange={(e) => set('estimated_delivery_date', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Progression Mode</label>
              <select
                className={inputCls}
                value={form.auto_progression ? 'auto' : 'manual'}
                onChange={(e) => set('auto_progression', e.target.value === 'auto')}
              >
                <option value="auto">Automatic (status updates itself from dates)</option>
                <option value="manual">Manual (I'll set status myself)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Update Interval</label>
              <select
                className={inputCls}
                value={form.update_interval_days}
                onChange={(e) => set('update_interval_days', parseInt(e.target.value, 10))}
              >
                <option value={1}>Every 1 day</option>
                <option value={2}>Every 2 days</option>
                <option value={3}>Every 3 days</option>
                <option value={7}>Custom (7 days)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Custom Tracking Number (optional)</label>
          <input
            className={inputCls}
            placeholder="Leave blank to auto-generate"
            value={form.custom_tracking_number}
            onChange={(e) => set('custom_tracking_number', e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            disabled={saving || !form.order_id || !form.product_name || !form.origin_city || !form.destination_city}
            onClick={save}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Generating & Saving...' : 'Generate Tracking, Route & Save'}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
