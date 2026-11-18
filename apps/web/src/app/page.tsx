'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { usePropertyStore } from '../lib/property-store';
import { PropertyCard } from '../components/PropertyCard';
import { MANDYA_TALUKS } from '@mandya-realestate/shared';
import { Search, MapPin, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const { properties, favorites, toggleFavorite } = usePropertyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState<string>('ALL');
  const [activeIntent, setActiveIntent] = useState<'ALL' | 'BUY' | 'RENT' | 'PLOT' | 'AGRICULTURAL'>('ALL');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedTaluk !== 'ALL') params.set('taluk', selectedTaluk);
    if (activeIntent !== 'ALL') {
      if (activeIntent === 'BUY') params.set('transaction', 'SALE');
      if (activeIntent === 'RENT') params.set('transaction', 'RENT');
      if (activeIntent === 'PLOT') params.set('category', 'PLOT');
      if (activeIntent === 'AGRICULTURAL') params.set('category', 'AGRICULTURAL');
    }
    router.push(`/search?${params.toString()}`);
  };

  const published = properties.filter((p) => p.status === 'PUBLISHED');
  const featured = published.filter((p) => p.isFeatured);
  const recent = published.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-900 via-teal-800 to-teal-700 text-white pt-8 pb-14 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold mb-4 text-teal-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{locale === 'kn' ? 'ಮಂಡ್ಯ ಜಿಲ್ಲೆಯ ಅಧಿಕೃತ ಪ್ರಾಪರ್ಟಿ ತಾಣ' : 'Mandya District Property Portal'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {locale === 'kn' ? (
              <>ಮಂಡ್ಯದಲ್ಲಿ ನಿಮ್ಮ ಕನಸಿನ <span className="text-amber-300">ಮನೆ, ನಿವೇಶನ & ಜಮೀನು</span> ಹುಡುಕಿ</>
            ) : (
              <>Find Your Dream <span className="text-amber-300">Home, Plot & Farmland</span> in Mandya</>
            )}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-teal-100 max-w-2xl mx-auto">
            {t('tagline')}
          </p>

          {/* Search Card */}
          <div className="mt-8 bg-white rounded-3xl p-3 sm:p-5 shadow-2xl text-gray-900 border border-gray-100 text-left">
            {/* Segmented Intent Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-gray-100 no-scrollbar">
              {[
                { id: 'ALL', label: locale === 'kn' ? 'ಎಲ್ಲವೂ' : 'All' },
                { id: 'BUY', label: t('buy') },
                { id: 'RENT', label: t('rent') },
                { id: 'PLOT', label: t('plot') },
                { id: 'AGRICULTURAL', label: locale === 'kn' ? 'ಕೃಷಿ ಜಮೀನು' : 'Farmland' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveIntent(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    activeIntent === tab.id
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inputs & CTA */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              {/* Taluk Selector */}
              <div className="md:w-1/3 relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-teal-700" />
                <select
                  value={selectedTaluk}
                  onChange={(e) => setSelectedTaluk(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value="ALL">{t('all_taluks')}</option>
                  {Object.values(MANDYA_TALUKS).map((taluk) => (
                    <option key={taluk.id} value={taluk.id}>
                      {locale === 'kn' ? taluk.nameKn : taluk.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keyword Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-7 py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>{locale === 'kn' ? 'ಹುಡುಕಿ' : 'Search'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Taluk Quick Chips */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold text-navy-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-700" />
              <span>{locale === 'kn' ? 'ತಾಲೂಕುವಾರು ಅನ್ವೇಷಿಸಿ' : 'Explore by Taluk'}</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {Object.values(MANDYA_TALUKS).map((taluk) => (
              <Link
                key={taluk.id}
                href={`/search?taluk=${taluk.id}`}
                className="bg-white p-3 rounded-xl border border-gray-200/80 hover:border-teal-700 hover:shadow-sm transition-all text-center group"
              >
                <div className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-teal-700">
                  {locale === 'kn' ? taluk.nameKn.split(' ')[0] : taluk.nameEn.split(' ')[0]}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Mandya Dist</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Listings */}
        {featured.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                  {locale === 'kn' ? 'ಪ್ರಮುಖ ಆಸ್ತಿಗಳು' : 'Featured Properties'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {locale === 'kn' ? 'ಪರಿಶೀಲಿಸಿದ ಮತ್ತು ನೇರ ಮಾಲೀಕರ ಪ್ರಾಪರ್ಟಿಗಳು' : 'Handpicked and verified listings in Mandya'}
                </p>
              </div>
              <Link
                href="/search"
                className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>{locale === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ' : 'View All'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isSaved={favorites.includes(prop.id)}
                  onToggleSave={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                {locale === 'kn' ? 'ಇತ್ತೀಚಿನ ಜಾಹೀರಾತುಗಳು' : 'Recent Listings'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {locale === 'kn' ? 'ಹೊಸದಾಗಿ ನೋಂದಾಯಿಸಲಾದ ಪ್ರಾಪರ್ಟಿಗಳು' : 'Newly added sites, houses, and farmland'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                isSaved={favorites.includes(prop.id)}
                onToggleSave={toggleFavorite}
              />
            ))}
          </div>
        </div>

        {/* Karnataka RERA & Transparency Notice */}
        <div className="bg-white rounded-2xl p-5 border border-teal-200/80 shadow-sm flex flex-col md:flex-row items-start gap-4">
          <div className="p-3 bg-teal-50 rounded-xl text-teal-700 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-1">
              {locale === 'kn' ? 'ಕಾನೂನು ಎಚ್ಚರಿಕೆ & ಗ್ರಾಹಕರ ಸುರಕ್ಷತೆ' : 'Karnataka RERA & Legal Safety Advisory'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('rera_disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
