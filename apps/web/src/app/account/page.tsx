'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { usePropertyStore } from '../../lib/property-store';
import { PropertyCard } from '../../components/PropertyCard';
import { User, Building, MessageSquare, Calendar, PlusCircle, ShieldCheck } from 'lucide-react';

export default function AccountPage() {
  const { locale, t } = useLanguage();
  const { properties, enquiries, siteVisits, updatePropertyStatus } = usePropertyStore();
  const [activeTab, setActiveTab] = useState<'LISTINGS' | 'ENQUIRIES' | 'VISITS'>('LISTINGS');

  // Let's filter seller properties (e.g. ones with status PENDING_APPROVAL or all)
  const myProps = properties.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F5F7F6] py-8 px-4 pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold text-navy-900">Abhilash Raju</h1>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs text-gray-500 font-medium">Mandya Properties Member | +91 98450 12345</div>
              <div className="text-[11px] text-teal-800 font-bold mt-1 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block">
                Role: Property Owner & Seeker
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/post"
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav_post')}</span>
            </Link>
            <Link
              href="/admin"
              className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>Admin Queue</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('LISTINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'LISTINGS' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>My Listings ({myProps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ENQUIRIES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ENQUIRIES' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Received Enquiries ({enquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('VISITS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'VISITS' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Site Visit Requests ({siteVisits.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'LISTINGS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProps.map((prop) => (
                <div key={prop.id} className="relative group">
                  <PropertyCard property={prop} />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => updatePropertyStatus(prop.id, 'SOLD_OR_RENTED')}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 rounded-lg"
                    >
                      Mark as Sold
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ENQUIRIES' && (
          <div className="space-y-3">
            {enquiries.length > 0 ? (
              enquiries.map((enq) => (
                <div key={enq.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-teal-800">For Listing: {enq.propertyCode}</div>
                    <div className="text-sm font-bold text-navy-900 mt-0.5">{enq.seekerName} ({enq.seekerPhone})</div>
                    <p className="text-xs text-gray-600 mt-1">&ldquo;{enq.message}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${enq.seekerPhone}`}
                      className="bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                    >
                      Call Seeker
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl text-center text-xs text-gray-500">
                No buyer enquiries received yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'VISITS' && (
          <div className="space-y-3">
            {siteVisits.length > 0 ? (
              siteVisits.map((vis) => (
                <div key={vis.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-teal-800">Listing: {vis.propertyCode}</div>
                    <div className="text-sm font-bold text-navy-900 mt-0.5">{vis.seekerName} ({vis.seekerPhone})</div>
                    <div className="text-xs text-amber-700 font-bold mt-1">
                      Scheduled Date: {vis.preferredDate} ({vis.preferredTimeSlot})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                      Confirm Visit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-2xl text-center text-xs text-gray-500">
                No site visit requests yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
