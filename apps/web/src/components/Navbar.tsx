'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { MANDYA_TALUKS, MandyaTaluk } from '@mandya-realestate/shared';
import { MapPin, Globe, Shield, PlusCircle } from 'lucide-react';

export const Navbar = () => {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
            M
          </div>
          <div>
            <div className="font-bold text-lg leading-tight text-navy-900">
              {locale === 'kn' ? 'ಮಂಡ್ಯ ಪ್ರಾಪರ್ಟೀಸ್' : 'Mandya Properties'}
            </div>
            <div className="text-[11px] text-teal-700 font-medium tracking-tight">
              {locale === 'kn' ? 'ವಿಶ್ವಾಸಾರ್ಹ ರಿಯಲ್ ಎಸ್ಟೇಟ್' : 'Karnataka Real Estate Marketplace'}
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/search?transaction=SALE" className="text-sm font-medium text-gray-700 hover:text-teal-700">
            {t('buy')}
          </Link>
          <Link href="/search?transaction=RENT" className="text-sm font-medium text-gray-700 hover:text-teal-700">
            {t('rent')}
          </Link>
          <Link href="/search?category=PLOT" className="text-sm font-medium text-gray-700 hover:text-teal-700">
            {t('plot')}
          </Link>
          <Link href="/search?category=AGRICULTURAL" className="text-sm font-medium text-gray-700 hover:text-teal-700">
            {locale === 'kn' ? 'ಕೃಷಿ ಜಮೀನು' : 'Agricultural Land'}
          </Link>
          <Link href="/search?category=COMMERCIAL" className="text-sm font-medium text-gray-700 hover:text-teal-700">
            {t('commercial')}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Bilingual Toggle */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'kn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-700/30 bg-teal-50 text-teal-800 text-xs font-semibold hover:bg-teal-100 transition-colors"
            title="Toggle Kannada / English"
          >
            <Globe className="w-3.5 h-3.5 text-teal-700" />
            <span>{locale === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Post Property Desktop CTA */}
          <Link
            href="/post"
            className="hidden sm:inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('nav_post')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
