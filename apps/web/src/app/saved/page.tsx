'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { usePropertyStore } from '../../lib/property-store';
import { PropertyCard } from '../../components/PropertyCard';
import { Heart, Compass } from 'lucide-react';

export default function SavedPage() {
  const { locale, t } = useLanguage();
  const { properties, favorites, toggleFavorite } = usePropertyStore();

  const savedProps = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F5F7F6] py-8 px-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-navy-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span>{locale === 'kn' ? 'ಮೆಚ್ಚಿದ ಪ್ರಾಪರ್ಟಿಗಳು' : 'Saved Properties'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {locale === 'kn'
              ? 'ನೀವು ಉಳಿಸಿರುವ ಆಸ್ತಿಗಳು ಇಲ್ಲಿ ಸಂಗ್ರಹವಾಗಿರುತ್ತವೆ (ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಲಭ್ಯ).'
              : 'Your bookmarked properties for quick access and offline reference.'}
          </p>
        </div>

        {savedProps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProps.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                isSaved={true}
                onToggleSave={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-navy-900 mb-1">
              {locale === 'kn' ? 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಾಪರ್ಟಿ ಉಳಿಸಿಲ್ಲ' : 'No saved properties yet'}
            </h2>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {locale === 'kn'
                ? 'ಪ್ರಾಪರ್ಟಿ ಕಾರ್ಡ್‌ಗಳಲ್ಲಿರುವ ಹಾರ್ಟ್ ಐಕಾನ್ ಒತ್ತಿ ಇಲ್ಲಿ ಉಳಿಸಬಹುದು.'
                : 'Tap the heart icon on any listing card to save it to your shortlist.'}
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>{t('nav_explore')}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
