import React from 'react';
import Link from 'next/link';
import { Home, Search, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Property Not Found
        </h1>
        <p className="text-kannada text-lg text-emerald-800 font-medium mb-3">
          ಆಸ್ತಿ ಕಂಡುಬಂದಿಲ್ಲ
        </p>
        <p className="text-slate-600 text-sm mb-6">
          The property you are looking for is either unavailable, has been sold, or is pending verification by our moderation team.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 text-white font-medium text-sm hover:bg-emerald-800 transition"
          >
            <Search className="w-4 h-4" />
            <span>Search Properties</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
