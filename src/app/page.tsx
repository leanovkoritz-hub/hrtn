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
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {/* Clean Vector Logo for White Background */}
          <svg
            viewBox="0 0 850 140"
            className="h-10 w-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Speed Lines */}
            <path d="M 10 50 L 60 50 C 63 50 65 52 65 55 C 65 58 63 60 60 60 L 10 60 C 7 60 5 58 5 55 C 5 52 7 50 10 50 Z" fill="#0A5CDB" />
            <path d="M 25 70 L 80 70 C 83 70 85 72 85 75 C 85 78 83 80 80 80 L 25 80 C 22 80 20 78 20 75 C 20 72 22 70 25 70 Z" fill="#0A5CDB" />
            <path d="M 45 90 L 100 90 C 103 90 105 92 105 95 C 105 98 103 100 100 100 L 45 100 C 42 100 40 98 40 95 C 40 92 42 90 45 90 Z" fill="#0A5CDB" />
            
            {/* Stylized 'S' Icon */}
            <path d="M 175 25 L 100 25 C 70 25 45 42 45 65 C 45 83 60 93 90 98 L 135 105 C 153 108 162 114 162 123 C 162 132 148 138 125 138 L 40 138 L 53 120 L 125 120 C 134 120 141 117 141 112 C 141 106 132 102 116 99 L 70 92 C 38 87 25 74 25 51 C 25 28 52 9 95 9 L 185 9 Z" fill="#0A5CDB" />
            
            {/* Box inside S */}
            <polygon points="105,45 145,32 168,50 128,63" fill="#E67E22" stroke="#1A252C" strokeWidth="2.5" />
            <polygon points="105,45 128,63 128,94 105,76" fill="#D35400" stroke="#1A252C" strokeWidth="2.5" />
            <polygon points="128,63 168,50 168,81 128,94" fill="#E67E22" stroke="#1A252C" strokeWidth="2.5" />
            
            {/* SimTrack Main Text */}
            <text x="190" y="100" fill="#0A5CDB" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="90" fontStyle="italic">SimTrack</text>

            {/* Subtext */}
            <text x="200" y="125" fill="#0B3C91" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="16" letterSpacing="6">TRACK • SHIP • DELIVER</text>
            
            {/* Vertical Separator */}
            <line x1="620" y1="15" x2="620" y2="125" stroke="#CBD5E1" strokeWidth="2.5" />
            
            {/* In Partnership Header */}
            <text x="640" y="32" fill="#0A5CDB" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="13" letterSpacing="2.5">IN PARTNERSHIP WITH</text>
            
            {/* FedEx Brand */}
            <g transform="translate(640, 42)">
              <text x="0" y="65" fill="#4D148C" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="72">Fed</text>
              <text x="125" y="65" fill="#FF6600" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="72">Ex</text>
              <text x="215" y="20" fill="#FF6600" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fontSize="16">®</text>
            </g>
          </svg>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Track your package
          </h1>
          <p className="text-slate-600 mb-8">
            Track your package to your destination track and ship and deliver.
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
