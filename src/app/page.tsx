import Link from 'next/link';
import { PackageIcon } from 'lucide-react';
import TrackingForm from '@/components/TrackingForm';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <PackageIcon className="h-6 w-6 text-brand-600" />
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

          <TrackingForm />
        </div>
      </section>

      <footer className="border-t bg-white px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SimTrack. All rights reserved.
      </footer>
    </div>
  );
}
