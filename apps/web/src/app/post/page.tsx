'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { MANDYA_TALUKS, MandyaTaluk, calculatePlotDimensionsArea, formatPriceINR } from '@mandya-realestate/shared';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Phone } from 'lucide-react';

export default function PostPropertyPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'OWNER' | 'AGENT' | 'BUILDER'>('OWNER');
  const [transaction, setTransaction] = useState<'SALE' | 'RENT'>('SALE');
  const [category, setCategory] = useState<'PLOT' | 'RESIDENTIAL' | 'AGRICULTURAL' | 'COMMERCIAL'>('PLOT');
  const [taluk, setTaluk] = useState<MandyaTaluk>('MANDYA');
  const [locality, setLocality] = useState('');
  const [dimensions, setDimensions] = useState('30x40');
  const [areaSqft, setAreaSqft] = useState(1200);
  const [priceInr, setPriceInr] = useState(2500000); // 25 Lakh
  const [titleEn, setTitleEn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [sellerName, setSellerName] = useState('Raghavendra Gowda');
  const [sellerPhone, setSellerPhone] = useState('+919845012345');
  const [otpCode, setOtpCode] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdCode, setCreatedCode] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('mandya_auth_token');
    if (savedToken) {
      setAuthToken(savedToken);
    }
  }, []);

  // Update sqft when plot dimension changes
  const handleDimensionChange = (val: string) => {
    setDimensions(val);
    const sqft = calculatePlotDimensionsArea(val);
    if (sqft) setAreaSqft(sqft);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Ensure user is authenticated via OTP
      let token = authToken;
      if (!token) {
        // Request and verify OTP in dev mode
        await fetch('/api/v1/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: sellerPhone }),
        });

        const verifyRes = await fetch('/api/v1/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: sellerPhone, code: otpCode || '123456', name: sellerName, role }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || 'OTP verification failed');

        token = verifyData.token;
        setAuthToken(token);
        if (token) {
          localStorage.setItem('mandya_auth_token', token);
          localStorage.setItem('mandya_user_profile', JSON.stringify(verifyData.user));
        }
      }

      // 2. Submit property to server
      const payload = {
        titleEn: titleEn || `${dimensions} ${category} in ${locality || taluk}`,
        titleKn: `${locality || taluk} ನಲ್ಲಿ ${dimensions} ಪ್ರಾಪರ್ಟಿ`,
        descriptionEn: descEn || 'Clear title property in Mandya district.',
        descriptionKn: 'ಮಂಡ್ಯ ಜಿಲ್ಲೆಯಲ್ಲಿ ಸ್ಪಷ್ಟ ದಾಖಲೆ ಹೊಂದಿರುವ ಆಸ್ತಿ.',
        category,
        subType: category === 'PLOT' ? 'RESIDENTIAL_SITE' : 'INDEPENDENT_HOUSE',
        transactionType: transaction,
        priceInr,
        isNegotiable: true,
        location: {
          id: `loc-${Date.now()}`,
          taluk,
          localityEn: locality || 'Town Area',
          localityKn: locality || 'ಟೌನ್ ಏರಿಯಾ',
          pinCode: '571401',
          latitude: 12.524,
          longitude: 76.895,
        },
        addressGranularity: 'APPROXIMATE_RADIUS',
        fuzzedLatitude: 12.524,
        fuzzedLongitude: 76.895,
        areaSqft,
        plotDimensions: dimensions,
        waterSource: ['MUNICIPAL_SUPPLY'],
        approvals: ['MUDA_APPROVED'],
        media: [
          {
            id: `m-${Date.now()}`,
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            isCover: true,
            order: 0,
          },
        ],
        amenities: ['tar_road', 'electricity'],
        sellerType: role,
        sellerName,
        sellerPhoneMasked: '+91 98XXX XXXXX',
        sellerPhoneDirect: sellerPhone,
        whatsappNumber: sellerPhone,
      };

      const res = await fetch('/api/v1/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit listing');

      setCreatedCode(data.property.propertyCode);
      setIsSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto p-6 my-12 bg-white rounded-3xl shadow-xl text-center border border-gray-100">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-navy-900 mb-1">
          {locale === 'kn' ? 'ಜಾಹೀರಾತು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!' : 'Listing Submitted for Moderation!'}
        </h2>
        <div className="text-sm font-mono font-bold text-teal-800 mb-3">Code: {createdCode}</div>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          {locale === 'kn'
            ? 'ನಿಮ್ಮ ಪ್ರಾಪರ್ಟಿಯನ್ನು ಮಂಡ್ಯ ಪ್ರಾಪರ್ಟೀಸ್ ಅಡ್ಮಿನ್ ತಂಡವು ಪರಿಶೀಲಿಸಿ ಶೀಘ್ರದಲ್ಲೇ ಪ್ರಕಟಿಸುತ್ತದೆ.'
            : 'Your property has been submitted. Our Mandya Properties moderator team will verify and approve it shortly.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/account')}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
          >
            Go to My Dashboard
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="bg-navy-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
          >
            View in Admin Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-md border border-gray-100 p-6 sm:p-8">
        {/* Stepper Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-navy-900">
              {locale === 'kn' ? 'ಹೊಸ ಪ್ರಾಪರ್ಟಿ ಜಾಹೀರಾತು ಹಾಕಿ' : 'Post Free Property Listing'}
            </h1>
            <div className="text-xs text-teal-700 font-semibold">
              Step {step} of 5 — {step === 1 ? t('step_1') : step === 2 ? t('step_2') : step === 3 ? t('step_3') : step === 4 ? t('step_4') : t('step_5')}
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full ${i <= step ? 'bg-teal-700' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Form */}
        <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
          {/* Step 1: Role & Category */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">You are listing as:</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['OWNER', 'AGENT', 'BUILDER'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                        role === r ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-sm' : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {r === 'OWNER' ? 'Property Owner' : r === 'AGENT' ? 'Local Agent' : 'Developer'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Transaction Type:</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['SALE', 'RENT'] as const).map((tType) => (
                    <button
                      key={tType}
                      type="button"
                      onClick={() => setTransaction(tType)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                        transaction === tType ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-sm' : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {tType === 'SALE' ? 'Sell (ಮಾರಾಟ)' : 'Rent (ಬಾಡಿಗೆ)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Category:</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['PLOT', 'RESIDENTIAL', 'AGRICULTURAL', 'COMMERCIAL'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                        category === cat ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-sm' : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {cat === 'PLOT' ? 'Plots / Sites (30x40)' : cat === 'RESIDENTIAL' ? 'House / Villa' : cat === 'AGRICULTURAL' ? 'Agricultural Farmland' : 'Commercial'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Select Taluk (Mandya District):</label>
                <select
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value as MandyaTaluk)}
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-bold"
                >
                  {Object.values(MANDYA_TALUKS).map((tlk) => (
                    <option key={tlk.id} value={tlk.id}>{tlk.nameEn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Locality / Village Name:</label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. VV Nagar, Guthalu Colony, Shivapura"
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* Step 3: Attributes & Price */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Plot Dimensions (ft):</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['30x40', '40x60', '50x80'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDimensionChange(d)}
                      className={`py-2 rounded-xl text-xs font-bold border ${dimensions === d ? 'bg-teal-700 text-white' : 'bg-gray-50'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-gray-500">
                  Calculated Area: <span className="font-bold text-teal-800">{areaSqft} sq.ft</span> (~{(areaSqft / 1089).toFixed(2)} Gunta)
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Asking Price (INR):</label>
                <input
                  type="number"
                  required
                  value={priceInr}
                  onChange={(e) => setPriceInr(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-bold"
                />
                <div className="text-xs font-bold text-teal-700 mt-1">
                  {formatPriceINR(priceInr, locale)}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Title & Description */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Property Title:</label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. East Facing 30x40 MUDA Site with Cauvery Water"
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Detailed Description:</label>
                <textarea
                  rows={4}
                  required
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="Mention road width, nearby landmarks, soil quality, water source..."
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* Step 5: Contact, OTP & Submit */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Your Full Name:</label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="e.g. Ramesh Gowda"
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Number (Phone OTP):</label>
                <input
                  type="tel"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full p-3 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              {!authToken && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Enter OTP Code (Development Mock: 123456):
                  </label>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              )}

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900">
                Notice: All listings undergo server verification before appearing publicly to maintain trust in Mandya Properties.
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{step === 5 ? t('submit_listing') : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
