import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import StatusBadge from '@/components/StatusBadge';
import { dashboardCounts, listShipments, refreshShipmentStatus } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const counts = dashboardCounts();
  const recent = listShipments()
    .slice(0, 8)
    .map((s) => refreshShipmentStatus(s.id) ?? s);

  const cards = [
    { label: 'Total Shipments', value: counts.total, accent: 'text-slate-900' },
    { label: 'Processing', value: counts.PROCESSING, accent: 'text-amber-600' },
    { label: 'In Transit', value: counts.IN_TRANSIT, accent: 'text-blue-600' },
    { label: 'Out for Delivery', value: counts.OUT_FOR_DELIVERY, accent: 'text-purple-600' },
    { label: 'Delivered', value: counts.DELIVERED, accent: 'text-emerald-600' },
  ];

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Link
          href="/admin/shipments/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          + Create Shipment
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${c.accent}`}>{c.value}</div>
            <div className="text-xs text-slate-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Recent Shipments</h2>
          <Link href="/admin/shipments" className="text-sm text-brand-600 font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              No shipments yet. Create your first one to get started.
            </p>
          )}
          {recent.map((s) => (
            <Link
              key={s.id}
              href={`/admin/shipments/${s.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div>
                <div className="font-medium text-slate-900 text-sm">{s.product_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {s.tracking_number} &middot; {s.origin_city}, {s.origin_state} &rarr; {s.destination_city}, {s.destination_state}
                </div>
              </div>
              <StatusBadge status={s.current_status} />
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
