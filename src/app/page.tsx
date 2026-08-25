'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    router.push(`/track/${encodeURIComponent(trackingNumber.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          SimTrack
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Track your package
          </h1>
          <p className="text-slate-600 mb-8">
            Enter your tracking number below to see real-time status updates for your shipment.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
            >
              Track
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t bg-white px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SimTrack. All rights reserved.
      </footer>
    </div>
  );
}
