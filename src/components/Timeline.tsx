import type { TrackingEvent } from '@/lib/types';
import { CheckIcon, ClockIcon } from '@/components/icons';

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');

  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;

  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function Timeline({
  events,
  todayIso,
}: {
  events: TrackingEvent[];
  todayIso: string;
}) {
  // Newest event first
  const sorted = [...events].sort(
    (a, b) => b.event_order - a.event_order
  );

  // Only show events that have actually happened.
  // Future events are completely hidden.
  const visibleEvents = sorted.filter(
    (ev) => ev.event_date <= todayIso
  );

  return (
    <ol className="relative border-l-2 border-slate-200 ml-3">
      {visibleEvents.map((ev) => {
        return (
          <li
            key={ev.id}
            className="mb-8 ml-6 last:mb-0 animate-fade-in-up"
          >
            <span
              className="absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white bg-brand-600 text-white"
            >
              <CheckIcon className="h-3 w-3" />
            </span>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <h3 className="font-semibold text-sm text-slate-900">
                  {ev.status}
                </h3>

                <span className="text-xs text-slate-400">
                  {formatDate(ev.event_date)} &middot;{' '}
                  {formatTime(ev.event_time)}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {ev.location}
              </p>

              {ev.description && (
                <p className="text-sm text-slate-600 mt-2">
                  {ev.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}