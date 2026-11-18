'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { PropertyCard } from '../../components/PropertyCard';
import { PropertyListing, SeekerEnquiry, SiteVisitRequest } from '@mandya-realestate/shared';
import { User, Building, MessageSquare, Calendar, PlusCircle, ShieldCheck, LogOut, Phone, CheckCircle, Loader2 } from 'lucide-react';

export default function AccountPage() {
  const { locale, t } = useLanguage();

  const [user, setUser] = useState<{ id: string; name: string; phone: string; role: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Phone OTP Sign-in state
  const [phoneInput, setPhoneInput] = useState('+919845012345');
  const [otpInput, setOtpInput] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Data
  const [myProperties, setMyProperties] = useState<PropertyListing[]>([]);
  const [receivedEnquiries, setReceivedEnquiries] = useState<SeekerEnquiry[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'LISTINGS' | 'ENQUIRIES' | 'VISITS'>('LISTINGS');

  const loadUserData = (authToken: string) => {
    setLoading(true);
    // 1. Fetch user profile
    fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${authToken}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        // 2. Fetch my properties
        return fetch('/api/v1/properties/my', { headers: { Authorization: `Bearer ${authToken}` } });
      })
      .then((res) => res.json())
      .then((data) => {
        setMyProperties(data.properties || []);
        // 3. Fetch received enquiries
        return fetch('/api/v1/enquiries/my', { headers: { Authorization: `Bearer ${authToken}` } });
      })
      .then((res) => res.json())
      .then((data) => {
        setReceivedEnquiries(data.received || []);
        // 4. Fetch site visits
        return fetch('/api/v1/site-visits/my', { headers: { Authorization: `Bearer ${authToken}` } });
      })
      .then((res) => res.json())
      .then((data) => {
        setSiteVisits(data.siteVisits || []);
        setLoading(false);
      })
      .catch(() => {
        logout();
        setLoading(false);
      });
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('mandya_auth_token');
    if (savedToken) {
      setToken(savedToken);
      loadUserData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      const res = await fetch('/api/v1/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      const res = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput.trim(), code: otpInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('mandya_auth_token', data.token);
      localStorage.setItem('mandya_user_profile', JSON.stringify(data.user));
      loadUserData(data.token);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSigningIn(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mandya_auth_token');
    localStorage.removeItem('mandya_user_profile');
  };

  const handleMarkSold = async (propId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/properties/${propId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'SOLD_OR_RENTED' }),
      });
      if (res.ok) {
        setMyProperties((prev) =>
          prev.map((p) => (p.id === propId ? { ...p, status: 'SOLD_OR_RENTED' } : p))
        );
      }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-teal-700 animate-spin mb-2" />
        <p className="text-xs text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  // If not signed in: Render Phone OTP Login Screen
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg border border-gray-100">
          <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-navy-900 mb-1">
            {locale === 'kn' ? 'ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign in with Mobile OTP'}
          </h1>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Access your property listings, incoming buyer leads, and scheduled site visits in Mandya.
          </p>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Phone Number:</label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 9XXXXXXXXX"
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={signingIn}
                className="w-full bg-teal-700 text-white font-bold py-3 rounded-xl text-xs hover:bg-teal-800 disabled:opacity-50"
              >
                {signingIn ? 'Sending OTP...' : 'Get OTP Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Enter 6-Digit OTP (Dev Mock: 123456):
                </label>
                <input
                  type="text"
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-mono font-bold text-center tracking-widest text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={signingIn}
                className="w-full bg-teal-700 text-white font-bold py-3 rounded-xl text-xs hover:bg-teal-800 disabled:opacity-50"
              >
                {signingIn ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-400">
              Test Accounts: Owner (`+919845012345`) | Admin (`+919900011223`)
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] py-8 px-4 pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold text-navy-900">{user.name}</h1>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs text-gray-500 font-medium">Mandya Properties Member | {user.phone}</div>
              <div className="text-[11px] text-teal-800 font-bold mt-1 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block">
                Role: {user.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/post"
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav_post')}</span>
            </Link>
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>Admin Queue</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
            <span>My Listings ({myProperties.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ENQUIRIES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ENQUIRIES' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Received Enquiries ({receivedEnquiries.length})</span>
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
            {myProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProperties.map((prop) => (
                  <div key={prop.id} className="relative group">
                    <PropertyCard property={prop} />
                    <div className="mt-2 flex gap-2">
                      {prop.status !== 'SOLD_OR_RENTED' ? (
                        <button
                          onClick={() => handleMarkSold(prop.id)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-1.5 rounded-lg"
                        >
                          Mark as Sold
                        </button>
                      ) : (
                        <span className="flex-1 text-center bg-gray-100 text-gray-500 text-xs font-bold py-1.5 rounded-lg">
                          Sold / Rented
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100">
                <Building className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-navy-900">No properties posted yet</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">Post your first Mandya listing for free!</p>
                <Link
                  href="/post"
                  className="bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Property</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ENQUIRIES' && (
          <div className="space-y-3">
            {receivedEnquiries.length > 0 ? (
              receivedEnquiries.map((enq) => (
                <div key={enq.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-teal-800">For Listing: {enq.propertyCode}</div>
                    <div className="text-sm font-bold text-navy-900 mt-0.5">{enq.seekerName} ({enq.seekerPhone})</div>
                    <p className="text-xs text-gray-600 mt-1">&ldquo;{enq.message}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${enq.seekerPhone}`}
                      className="bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Seeker</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-2xl text-center text-xs text-gray-500">
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
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                      {vis.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-2xl text-center text-xs text-gray-500">
                No site visit requests yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
