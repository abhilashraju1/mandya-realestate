'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { PropertyListing, formatPriceINR, formatAreaDisplay } from '@mandya-realestate/shared';
import {
  MapPin, Phone, MessageCircle, Calendar, Heart, Share2, ArrowLeft,
  CheckCircle, Shield, X, AlertCircle, Loader2
} from 'lucide-react';

export function PropertyDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { locale, t } = useLanguage();

  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [seekerName, setSeekerName] = useState('');
  const [seekerPhone, setSeekerPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Fetch property from Server API
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/v1/properties/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Property not found or not published');
        }
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setProperty(data.property);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e.message);
          setLoading(false);
        }
      });

    // Check favorite in local or account
    const saved = localStorage.getItem('mandya_saved_favorites');
    if (saved) {
      try {
        const favs: string[] = JSON.parse(saved);
        if (favs.includes(id)) setIsSaved(true);
      } catch (e) {}
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const toggleFavorite = () => {
    const saved = localStorage.getItem('mandya_saved_favorites');
    let favs: string[] = saved ? JSON.parse(saved) : [];
    if (favs.includes(id)) {
      favs = favs.filter((f) => f !== id);
      setIsSaved(false);
    } else {
      favs.push(id);
      setIsSaved(true);
    }
    localStorage.setItem('mandya_saved_favorites', JSON.stringify(favs));
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !seekerPhone || !seekerName) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyCode: property.propertyCode,
          seekerName,
          seekerPhone,
          message: enquiryMessage || 'I am interested in this listing.',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send enquiry');
      }

      setIsEnquiryModalOpen(false);
      setSuccessToast(locale === 'kn' ? 'ನಿಮ್ಮ ವಿಚಾರಣೆ ಕಳುಹಿಸಲಾಗಿದೆ!' : 'Enquiry sent to seller!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !visitDate || !seekerPhone) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyCode: property.propertyCode,
          seekerName,
          seekerPhone,
          preferredDate: visitDate,
          preferredTimeSlot: 'MORNING',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to request visit');
      }

      setIsVisitModalOpen(false);
      setSuccessToast(locale === 'kn' ? 'ಸ್ಥಳ ವೀಕ್ಷಣೆಗೆ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!' : 'Site visit requested successfully!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-teal-700 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-600">Loading property details from Mandya marketplace...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#F5F7F6] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Property Unavailable</h1>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          {error || 'This listing does not exist or has been paused/withdrawn by the moderator or owner.'}
        </p>
        <button
          onClick={() => router.push('/search')}
          className="bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-teal-800 transition-colors"
        >
          Browse Active Mandya Properties
        </button>
      </div>
    );
  }

  // WhatsApp Deep Link with property code
  const whatsappText = encodeURIComponent(
    `Hello, I am interested in property ${property.propertyCode} (${property.titleEn}) in ${property.location.localityEn}, Mandya listed on Mandya Properties.`
  );
  const whatsappUrl = `https://wa.me/${property.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-[#F5F7F6] pb-24 md:pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-teal-800 text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-amber-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Bar for Back & Actions */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-16 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === 'kn' ? 'ಹಿಂದಕ್ಕೆ' : 'Back to Results'}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              aria-label="Save Property"
              className="p-2 rounded-full border border-gray-200 text-gray-700 hover:text-red-500"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.titleEn, url: window.location.href });
                }
              }}
              aria-label="Share Property"
              className="p-2 rounded-full border border-gray-200 text-gray-700 hover:text-teal-700"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Gallery Hero */}
        <div className="relative aspect-[16/9] w-full bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-200 mb-6">
          <img
            src={property.media[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
            alt={property.titleEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-navy-900/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              {t('badge_demo')}
            </span>
            <span className="bg-teal-700/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
              {property.sellerType === 'OWNER' ? t('badge_owner') : t('badge_agent')}
            </span>
          </div>
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-medium">
            1 of {property.media.length || 1} Photos
          </div>
        </div>

        {/* Property Header */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 mb-1">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>
                  {locale === 'kn' ? property.location.localityKn : property.location.localityEn},{' '}
                  {property.location.taluk} Taluk, Mandya Dist (PIN: {property.location.pinCode})
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 leading-snug">
                {locale === 'kn' ? property.titleKn : property.titleEn}
              </h1>
              <div className="text-xs text-gray-400 font-mono mt-1">Code: {property.propertyCode}</div>
            </div>

            <div className="text-left md:text-right shrink-0">
              <div className="text-2xl sm:text-3xl font-black text-teal-800">
                {formatPriceINR(property.priceInr, locale)}
              </div>
              {property.isNegotiable && (
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  Negotiable Price
                </span>
              )}
            </div>
          </div>

          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-gray-100">
            <div className="bg-gray-50 p-3 rounded-2xl">
              <div className="text-[11px] text-gray-500 font-medium">Plot Area / ವಿಸ್ತೀರ್ಣ</div>
              <div className="text-sm font-extrabold text-navy-900 mt-0.5">
                {formatAreaDisplay(property.areaSqft, property.category, locale)}
              </div>
            </div>
            {property.plotDimensions && (
              <div className="bg-gray-50 p-3 rounded-2xl">
                <div className="text-[11px] text-gray-500 font-medium">Dimensions / ಅಳತೆ</div>
                <div className="text-sm font-extrabold text-navy-900 mt-0.5">{property.plotDimensions} ft</div>
              </div>
            )}
            {property.facing && (
              <div className="bg-gray-50 p-3 rounded-2xl">
                <div className="text-[11px] text-gray-500 font-medium">Facing / ದಿಕ್ಕು</div>
                <div className="text-sm font-extrabold text-navy-900 mt-0.5">{property.facing}</div>
              </div>
            )}
            {property.roadWidthFt && (
              <div className="bg-gray-50 p-3 rounded-2xl">
                <div className="text-[11px] text-gray-500 font-medium">Approach Road</div>
                <div className="text-sm font-extrabold text-navy-900 mt-0.5">{property.roadWidthFt} ft Tar Road</div>
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div className="pt-5">
            <h2 className="text-sm font-bold text-navy-900 mb-2">
              {locale === 'kn' ? 'ಆಸ್ತಿಯ ಸಂಪೂರ್ಣ ವಿವರಣೆ' : 'Property Description'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {locale === 'kn' ? property.descriptionKn : property.descriptionEn}
            </p>
          </div>
        </div>

        {/* Approvals & Legal Status */}
        {property.approvals && property.approvals.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6">
            <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-700" />
              <span>Planning Authority Approvals & Verification</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {property.approvals.map((app) => (
                <span key={app} className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  {app.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Seller Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg">
              {property.sellerName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-navy-900 text-sm">{property.sellerName}</div>
              <div className="text-xs text-gray-500">
                {property.sellerType === 'OWNER' ? 'Property Owner' : 'Verified Local Broker'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:${property.sellerPhoneDirect}`}
              className="flex-1 sm:flex-none bg-teal-50 text-teal-800 hover:bg-teal-100 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{t('call_seller')}</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Mobile-First CTA) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-2xl flex items-center justify-between gap-2 md:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
        <button
          onClick={() => setIsVisitModalOpen(true)}
          className="flex-1 bg-teal-700 text-white py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md"
        >
          <Calendar className="w-4 h-4" />
          <span>{t('schedule_visit')}</span>
        </button>
      </div>

      {/* Site Visit Modal */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-navy-900 text-sm">{t('schedule_visit')}</h3>
              <button onClick={() => setIsVisitModalOpen(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleVisitSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={seekerName}
                  onChange={(e) => setSeekerName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={seekerPhone}
                  onChange={(e) => setSeekerPhone(e.target.value)}
                  placeholder="+91 9XXXXXXXXX"
                  className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
