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
