import Link from 'next/link';
import {
  getShipmentByTrackingNumber,
  refreshShipmentStatus,
} from '@/lib/repository';
import { PackageIcon, PinIcon, TruckIcon } from '@/components/icons';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import Timeline from '@/components/Timeline';
import TrackSearchForm from '@/components/TrackSearchForm';

export const dynamic = 'force-dynamic';

const CARRIER_LABELS: Record<string, string> = {
  UPS: 'UPS-style',
  FEDEX: 'FedEx-style',
  USPS: 'USPS-style',
  DHL: 'DHL-style',
  CUSTOM: 'Standard',
};

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');

  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function PublicTrackingPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;

  const raw = decodeURIComponent(trackingNumber)
    .trim()
    .toUpperCase();

  const existing = getShipmentByTrackingNumber(raw);

  if (!existing) {
    return (
      <main className="min-h-screen flex flex-col">
        <SiteHeader />

        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              No shipment found
            </h1>

            <p className="text-slate-500 mb-6">
              We couldn&apos;t find a shipment matching{' '}
              <span className="font-mono">{raw}</span>.
              Double-check the tracking number and try again.
            </p>

            <TrackSearchForm />
          </div>
        </section>
      </main>
    );
  }

  const shipment =
    refreshShipmentStatus(existing.id) ?? existing;

  const todayIso = new Date()
    .toISOString()
    .slice(0, 10);

  const visibleEvents = shipment.events
    .filter((event) => event.event_date <= todayIso)
    .sort((a, b) => {
      if (a.event_date !== b.event_date) {
        return b.event_date.localeCompare(a.event_date);
      }

      return b.event_order - a.event_order;
    });

  const latest = visibleEvents[0];

  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />

      <section className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">

        {/* Tracking Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8 animate-fade-in-up">

          <div className="flex items-start justify-between flex-wrap gap-3 mb-6">

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">
                Tracking Number
              </p>

              <p className="font-mono text-lg font-bold text-slate-900">
                {shipment.tracking_number}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {CARRIER_LABELS[shipment.carrier] ?? 'Standard'} label
              </p>
            </div>

            <StatusBadge status={shipment.current_status} />
          </div>

          {/* Progress */}
          <ProgressBar status={shipment.current_status} />

          {/* Route Information */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">

            <InfoBlock
              icon={<PinIcon className="h-4 w-4" />}
              label="Current Location"
              value={shipment.current_location || '—'}
            />

            <InfoBlock
              icon={<PackageIcon className="h-4 w-4" />}
              label="From"
              value={`${shipment.origin_city}, ${shipment.origin_state}`}
            />

            <InfoBlock
              icon={<TruckIcon className="h-4 w-4" />}
              label="To"
              value={`${shipment.destination_city}, ${shipment.destination_state}`}
            />

          </div>

          {/* Shipment Dates */}
          <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">

            <div>
              <p className="text-xs text-slate-400">
                Ship Date
              </p>

              <p className="font-medium text-slate-800">
                {formatDate(shipment.ship_date)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Estimated Delivery
              </p>

              <p className="font-medium text-slate-800">
                {formatDate(shipment.estimated_delivery_date)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Order
              </p>

              <p className="font-medium text-slate-800">
                {shipment.order_id}
              </p>
            </div>

          </div>

          {/* Latest Update */}
          {latest && (
            <div className="mt-6 rounded-lg bg-brand-50 border border-brand-100 px-4 py-3">

              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-0.5">
                Latest Update
              </p>

              <p className="text-sm text-slate-800">
                {latest.status} — {latest.location} (
                {formatDate(latest.event_date)})
              </p>

            </div>
          )}

        </div>

        {/* Tracking History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">

          <h2 className="font-semibold text-slate-900 mb-6">
            Tracking History
          </h2>

          <Timeline
            events={shipment.events}
            todayIso={todayIso}
          />

        </div>

        {/* Search Another Tracking Number */}
        <div className="mt-8 max-w-md mx-auto">
          <TrackSearchForm />
        </div>

      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pb-8 px-6">
        thanks for shopping with us.
      </footer>

    </main>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">

      <span className="text-brand-600 mt-0.5">
        {icon}
      </span>

      <div>
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>

    </div>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">

      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center">

        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg text-slate-900"
        >
          <PackageIcon className="h-6 w-6 text-brand-600" />

          SimTrack
        </Link>

      </div>

    </header>
  );
}