'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { PropertyCard } from '../../components/PropertyCard';
import { MANDYA_TALUKS, PropertyListing, formatPriceINR } from '@mandya-realestate/shared';
import { INITIAL_PROPERTIES } from '../../lib/mock-data';
import { SlidersHorizontal, Map, List, X, Search, MapPin, Loader2 } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();

  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [taluk, setTaluk] = useState(searchParams.get('taluk') || 'ALL');
  const [transaction, setTransaction] = useState(searchParams.get('transaction') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [maxPrice, setMaxPrice] = useState<number>(10000000); // 1 Cr default
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  // Fetch properties from Server API based on active filters
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const params = new URLSearchParams();
    if (taluk !== 'ALL') params.set('taluk', taluk);
    if (transaction !== 'ALL') params.set('transaction', transaction);
    if (category !== 'ALL') params.set('category', category);
    if (maxPrice) params.set('maxPrice', maxPrice.toString());
    if (query.trim()) params.set('q', query.trim());

    fetch(`/api/v1/properties?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          setProperties(data.properties || INITIAL_PROPERTIES);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setProperties(INITIAL_PROPERTIES);
          setLoading(false);
        }
      });

    const saved = localStorage.getItem('mandya_saved_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {}
    }

    return () => {
      mounted = false;
    };
  }, [taluk, transaction, category, maxPrice, query]);

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('mandya_saved_favorites', JSON.stringify(updated));
  };

  const resetFilters = () => {
    setQuery('');
    setTaluk('ALL');
    setTransaction('ALL');
    setCategory('ALL');
    setMaxPrice(10000000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      {/* Sticky Filter Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {/* Quick Filter Chips & Mode Toggle */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-700" />
              <span>{t('filter')}</span>
              {(taluk !== 'ALL' || transaction !== 'ALL' || category !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-teal-700"></span>
              )}
            </button>

            {/* List vs Map Switch */}
            <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('LIST')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'LIST' ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-600'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{locale === 'kn' ? 'ಪಟ್ಟಿ' : 'List'}</span>
              </button>
              <button
                onClick={() => setViewMode('MAP')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'MAP' ? 'bg-white text-teal-800 shadow-sm' : 'text-gray-600'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>{locale === 'kn' ? 'ನಕ್ಷೆ' : 'Map'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Result Counter & Active Filters Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-gray-700">
            {loading ? (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                <span>Searching properties...</span>
              </span>
            ) : locale === 'kn' ? (
              <><span className="text-teal-700 font-extrabold">{properties.length}</span> ಪ್ರಾಪರ್ಟಿಗಳು ಲಭ್ಯವಿವೆ</>
            ) : (
              <>Showing <span className="text-teal-700 font-extrabold">{properties.length}</span> properties</>
            )}
          </div>
          {(taluk !== 'ALL' || transaction !== 'ALL' || category !== 'ALL' || query) && (
            <button
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-bold"
            >
              {t('reset_filters')}
            </button>
          )}
        </div>

        {/* View Mode: List vs Map */}
        {viewMode === 'LIST' ? (
          properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isSaved={favorites.includes(prop.id)}
                  onToggleSave={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {locale === 'kn' ? 'ಯಾವುದೇ ಪ್ರಾಪರ್ಟಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No properties found'}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {locale === 'kn'
                  ? 'ದಯವಿಟ್ಟು ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಸಡಿಲಿಸಿ ಅಥವಾ ಬೇರೆ ತಾಲೂಕು ಆಯ್ಕೆಮಾಡಿ.'
                  : 'Try adjusting your filters, expanding budget or selecting all taluks.'}
              </p>
              <button
                onClick={resetFilters}
                className="bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-teal-800 transition-colors"
              >
                {t('reset_filters')}
              </button>
            </div>
          )
        ) : (
          /* Privacy-Preserving Map Preview View */
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl mb-4 text-xs text-teal-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                {locale === 'kn'
                  ? 'ಗೌಪ್ಯತೆ ನಿಯಮ: ಮಾಲೀಕರ ಭದ್ರತೆಗಾಗಿ ನಕ್ಷೆಯಲ್ಲಿ ಅಂದಾಜು ೧೫೦-೩೦೦ ಮೀಟರ್ ವೃತ್ತದಲ್ಲಿ ಮಾತ್ರ ಪಿನ್ ತೋರಿಸಲಾಗುತ್ತದೆ.'
                  : 'Privacy Policy: To protect owner privacy, public pins are fuzzed by 150-300m radius.'}
              </span>
            </div>

            {/* Stylized SVG Map Representation of Mandya District */}
            <div className="relative aspect-[16/9] w-full bg-slate-100 rounded-2xl flex items-center justify-center border border-gray-200 overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:16px_16px]"></div>

              {/* Pins representation */}
              <div className="relative z-10 w-full h-full p-8 flex flex-wrap gap-8 items-center justify-around">
                {properties.map((prop) => (
                  <div
                    key={prop.id}
                    className="group relative cursor-pointer"
                    onClick={() => window.location.assign(`/property/${prop.id}`)}
                  >
                    <div className="bg-teal-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1 hover:bg-navy-900 hover:scale-110 transition-all">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span>{formatPriceINR(prop.priceInr, locale)}</span>
                    </div>
                    {/* Tooltip on Hover */}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white p-2.5 rounded-xl shadow-xl border border-gray-200 text-left z-20">
                      <div className="font-bold text-xs text-gray-900 truncate">
                        {locale === 'kn' ? prop.titleKn : prop.titleEn}
                      </div>
                      <div className="text-[10px] text-teal-700 font-semibold mt-0.5">
                        {prop.location.localityEn}, {prop.location.taluk}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet Drawer Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                <span>{t('filter')}</span>
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 py-4">
              {/* Taluk */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  {t('select_taluk')}
                </label>
                <select
                  value={taluk}
                  onChange={(e) => setTaluk(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-teal-700"
                >
                  <option value="ALL">{t('all_taluks')}</option>
                  {Object.values(MANDYA_TALUKS).map((tlk) => (
                    <option key={tlk.id} value={tlk.id}>
                      {locale === 'kn' ? tlk.nameKn : tlk.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['ALL', 'SALE', 'RENT'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTransaction(type)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        transaction === type
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {type === 'ALL' ? 'All' : type === 'SALE' ? t('buy') : t('rent')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Property Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
                >
                  <option value="ALL">{t('all_categories')}</option>
                  <option value="RESIDENTIAL">Residential (House / Villa / Flat)</option>
                  <option value="PLOT">Plots / Sites (30x40, 40x60)</option>
                  <option value="AGRICULTURAL">Agricultural Farmland (ಕೃಷಿ ಜಮೀನು)</option>
                  <option value="COMMERCIAL">Commercial (Shop / Showroom / Office)</option>
                </select>
              </div>

              {/* Max Budget Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Max Budget</span>
                  <span className="text-teal-700 font-extrabold">
                    {formatPriceINR(maxPrice, locale)}
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="20000000"
                  step="500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>₹5 Lakh</span>
                  <span>₹2 Crore</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                {t('reset_filters')}
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800"
              >
                {t('apply_filters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading Mandya Properties...</div>}>
      <SearchContent />
    </Suspense>
  );
}
