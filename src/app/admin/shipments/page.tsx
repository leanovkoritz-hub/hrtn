'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import StatusBadge from '@/components/StatusBadge';
import type { ShipmentWithEvents } from '@/lib/types';

const STATUS_OPTIONS = ['ALL', 'PROCESSING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'];

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentWithEvents[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (status !== 'ALL') qs.set('status', status);
    const res = await fetch(`/api/shipments?${qs.toString()}`);
    const data = await res.json();
    setShipments(data.shipments ?? []);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function remove(id: number) {
    if (!confirm('Delete this shipment permanently? This cannot be undone.')) return;
    await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
    load();
  }

  function copyUrl(id: number, trackingNumber: string) {
    const url = `${window.location.origin}/track/${trackingNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Shipments</h1>
        <Link
          href="/admin/shipments/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          + Create Shipment
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tracking number, order ID, or product..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All statuses' : s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-3">Tracking #</th>
              <th className="text-left font-medium px-4 py-3">Order</th>
              <th className="text-left font-medium px-4 py-3">Route</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Delivery</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && shipments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No shipments found.
                </td>
              </tr>
            )}
            {shipments.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{s.tracking_number}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{s.order_id}</div>
                  <div className="text-xs text-slate-400">{s.product_name}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  {s.origin_city}, {s.origin_state} &rarr; {s.destination_city}, {s.destination_state}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.current_status} />
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{s.estimated_delivery_date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3 text-xs font-medium">
                    <button onClick={() => copyUrl(s.id, s.tracking_number)} className="text-slate-500 hover:text-brand-600">
                      {copiedId === s.id ? 'Copied!' : 'Copy URL'}
                    </button>
                    <Link href={`/track/${s.tracking_number}`} target="_blank" className="text-slate-500 hover:text-brand-600">
                      Preview
                    </Link>
                    <Link href={`/admin/shipments/${s.id}`} className="text-brand-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => remove(s.id)} className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
