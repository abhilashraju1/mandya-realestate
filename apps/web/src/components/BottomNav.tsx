'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { Home, Compass, PlusCircle, Heart, User } from 'lucide-react';

export const BottomNav = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide bottom nav on property details page so sticky action bar has full priority
  if (pathname.startsWith('/property/')) {
    return null;
  }

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
