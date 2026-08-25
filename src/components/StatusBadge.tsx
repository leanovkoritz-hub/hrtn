const STYLES: Record<string, string> = {
  PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_TRANSIT: 'bg-blue-50 text-blue-700 border-blue-200',
  OUT_FOR_DELIVERY: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EXCEPTION: 'bg-red-50 text-red-700 border-red-200',
};

const LABELS: Record<string, string> = {
  PROCESSING: 'Processing',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  const label = LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
