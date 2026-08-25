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
      <header className="bg-black px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {/* Inline SVG Logo */}
          <svg
            viewBox="0 0 950 160"
            className="h-12 w-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Speed Lines */}
            <path d="M 10 58 L 70 58 C 73 58 75 60 75 63 C 75 66 73 68 70 68 L 10 68 C 7 68 5 66 5 63 C 5 60 7 58 10 58 Z" fill="#0066FF" />
            <path d="M 30 78 L 95 78 C 98 78 100 80 100 83 C 100 86 98 88 95 88 L 30 88 C 27 88 25 86 25 83 C 25 80 27 78 30 78 Z" fill="#0066FF" />
            <path d="M 55 98 L 120 98 C 123 98 125 100 125 103 C 125 106 123 108 120 108 L 55 108 C 52 108 50 106 50 103 C 50 100 52 98 55 98 Z" fill="#0066FF" />
            
            {/* Stylized 'S' Icon with Box */}
            <path d="M 195 28 L 110 28 C 75 28 50 48 50 73 C 50 93 68 105 100 110 L 150 118 C 170 121 180 128 180 138 C 180 148 165 155 140 155 L 45 155 L 60 135 L 140 135 C 150 135 158 132 158 126 C 158 120 148 115 130 112 L 80 104 C 45 98 30 83 30 58 C 30 32 60 10 105 10 L 205 10 Z" fill="#0055FF" />
            
            {/* Box inside S */}
            <polygon points="115,50 160,35 185,55 140,70" fill="#E67E22" stroke="#1A252C" strokeWidth="3" />
            <polygon points="115,50 140,70 140,105 115,85" fill="#D35400" stroke="#1A252C" strokeWidth="3" />
            <polygon points="140,70 185,55 185,90 140,105" fill="#E67E22" stroke="#1A252C" strokeWidth="3" />
            
            {/* Simtrack Text */}
            <text x="200" y="112" fill="#0052CC" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="105" fontStyle="italic">Simtrack</text>

            {/* Subtext under Simtrack */}
            <text x="215" y="142" fill="#0A369D" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="18" letterSpacing="7">TRACK • SHIP • DELIVER</text>
            
            {/* Divider Line */}
            <line x1="615" y1="18" x2="615" y2="148" stroke="#888888" strokeWidth="3" />
            
            {/* Partnership Header */}
            <text x="640" y="38" fill="#1D4ED8" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="16" letterSpacing="4">IN PARTNERSHIP WITH</text>
            
            {/* FedEx Logo */}
            <g transform="translate(635, 52)">
              <text x="0" y="70" fill="#4D148C" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="82">Fed</text>
              <text x="142" y="70" fill="#FF6600" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="82">Ex</text>
              <text x="250" y="20" fill="#FF6600" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="20">®</text>
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
