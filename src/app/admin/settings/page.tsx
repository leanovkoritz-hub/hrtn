'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';

export default function AdminSettingsPage() {
  const [format, setFormat] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setFormat(d.tracking_format));
  }, []);

  async function save() {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracking_format: format }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-xl space-y-4">
        <h2 className="font-semibold text-slate-900">Tracking Number Format</h2>
        <p className="text-sm text-slate-500">
          Used as the fallback pattern when a carrier-specific style doesn&apos;t apply, or when generating a
          number for the &quot;Custom&quot; carrier style.{' '}
          <code className="bg-slate-100 px-1 rounded">{'{10}'}</code> inserts 10 random digits,{' '}
          <code className="bg-slate-100 px-1 rounded">{'{A10}'}</code> inserts 10 random letters/numbers.
          Everything else is kept literally.
        </p>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-600"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        />
        <p className="text-xs text-slate-400">Example output for the current format is shown on new shipments.</p>
        <button onClick={save} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          {saved ? 'Saved!' : 'Save Format'}
        </button>
      </div>
    </AdminShell>
  );
}
