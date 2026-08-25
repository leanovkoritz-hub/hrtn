import Link from 'next/link';
import TrackSearchForm from '@/components/TrackSearchForm';
import { PackageIcon } from '@/components/icons';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg text-slate-900">
            <PackageIcon className="h-6 w-6 text-brand-600" />
            SimTrack
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Track your package
          </h1>
          <p className="text-slate-500 mb-8">
            Enter your tracking number.
          </p>
          <TrackSearchForm />
          <p className="mt-10 text-xs text-slate-400 max-w-md mx-auto">
          </p>
        </div>
      </section>
    </main>
  );
}
