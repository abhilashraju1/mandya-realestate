'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { usePropertyStore } from '../../lib/property-store';
import { formatPriceINR } from '@mandya-realestate/shared';
import { ShieldCheck, Check, X, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const { locale, t } = useLanguage();
  const { properties, updatePropertyStatus } = usePropertyStore();

  const pendingListings = properties.filter((p) => p.status === 'PENDING_APPROVAL');
  const allListings = properties;

  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');

  return (
    <div className="min-h-screen bg-[#F5F7F6] py-8 px-4 pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-teal-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-navy-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-700" />
                <span>Admin Moderation Desk</span>
              </h1>
              <p className="text-xs text-gray-500">
                Review, verify and approve Mandya properties before public indexing
              </p>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'PENDING' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Pending Review ({pendingListings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ALL' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>All Published Listings ({allListings.length})</span>
          </button>
        </div>

        {/* Listings Queue */}
        <div className="space-y-4">
          {(activeTab === 'PENDING' ? pendingListings : allListings).map((prop) => (
            <div
              key={prop.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={prop.media[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                  alt={prop.titleEn}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800">{prop.propertyCode}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">
                      {prop.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prop.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {prop.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-navy-900 mt-1">{prop.titleEn}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {prop.location.localityEn}, {prop.location.taluk} | Asking: {formatPriceINR(prop.priceInr, locale)}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Seller: <span className="font-bold">{prop.sellerName}</span> ({prop.sellerPhoneDirect})
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {prop.status !== 'PUBLISHED' ? (
                  <>
                    <button
                      onClick={() => updatePropertyStatus(prop.id, 'PUBLISHED')}
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => updatePropertyStatus(prop.id, 'REJECTED')}
                      className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updatePropertyStatus(prop.id, 'PAUSED')}
                    className="flex-1 sm:flex-none bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-gray-300"
                  >
                    Pause Listing
                  </button>
                )}
              </div>
            </div>
          ))}

          {activeTab === 'PENDING' && pendingListings.length === 0 && (
            <div className="bg-white p-12 rounded-3xl text-center border border-gray-100">
              <Check className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-navy-900">Queue is clear!</h3>
              <p className="text-xs text-gray-500 mt-1">All submitted properties have been reviewed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
