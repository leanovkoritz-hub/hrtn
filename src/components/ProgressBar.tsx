const STEPS = [
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function ProgressBar({ status }: { status: string }) {
  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status)
  );
  const pct = status === 'EXCEPTION' ? 100 : (activeIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            status === 'EXCEPTION' ? 'bg-red-500' : 'bg-brand-600'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`text-[11px] font-medium ${
              i <= activeIndex && status !== 'EXCEPTION' ? 'text-brand-700' : 'text-slate-400'
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
