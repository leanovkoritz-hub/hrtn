'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackSearchForm() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. RR482739105US"
        className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
      />
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Track Package
      </button>
    </form>
  );
}
