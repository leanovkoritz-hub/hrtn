'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PackageIcon } from '@/components/icons';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/shipments', label: 'Shipments' },
  { href: '/admin/shipments/new', label: 'Create Shipment' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <PackageIcon className="h-5 w-5 text-brand-600" />
            SimTrack Admin
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-sm text-slate-500 hover:text-brand-600">
              View site
            </Link>
            <button
              onClick={logout}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
