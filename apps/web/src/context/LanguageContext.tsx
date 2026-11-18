'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DICTIONARY, SupportedLocale, getTranslation } from '@mandya-realestate/shared';

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (l: SupportedLocale) => void;
  t: (key: keyof typeof DICTIONARY['en']) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('mandya_prop_locale') as SupportedLocale;
    if (saved === 'en' || saved === 'kn') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: SupportedLocale) => {
    setLocaleState(l);
    localStorage.setItem('mandya_prop_locale', l);
  };

  const t = (key: keyof typeof DICTIONARY['en']) => getTranslation(key, locale);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
