import os

BASE = "/home/5296658037_0/.gemini/antigravity/scratch/mandya-realestate/apps/web/src"

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Wrote: {path}")

# 1. Navbar
write("components/Navbar.tsx", """
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
""")

# 2. BottomNav (Mobile Airbnb/Housing style)
write("components/BottomNav.tsx", """
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { Home, Compass, PlusCircle, Heart, User } from 'lucide-react';

export const BottomNav = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t('nav_home'), icon: Home },
    { href: '/search', label: t('nav_explore'), icon: Compass },
    { href: '/post', label: t('nav_post'), icon: PlusCircle, highlight: true },
    { href: '/saved', label: t('nav_saved'), icon: Heart },
    { href: '/account', label: t('nav_account'), icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-teal-800 transition-transform active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-teal-800 mt-0.5">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-colors ${
                isActive ? 'text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
""")

# 3. Layout
write("app/layout.tsx", """
import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';

export const metadata: Metadata = {
  title: 'Mandya Properties | ಮಂಡ್ಯ ಪ್ರಾಪರ್ಟೀಸ್ - Real Estate Marketplace',
  description: 'Verified real estate marketplace for Mandya district, Karnataka. Search agricultural land, 30x40 sites, independent houses, apartments, and commercial spaces across Mandya, Maddur, Srirangapatna, Pandavapura, Malavalli, Nagamangala, and KR Pete.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0F766E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col pb-16 md:pb-0 bg-[#F5F7F6]">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
""")

print("Core UI shell generated successfully")
